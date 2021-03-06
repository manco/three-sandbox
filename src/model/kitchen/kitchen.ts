import ModulesFactory from '../modules/modules-factory'
import {Message, Observable} from "../../utils/observable";
import {DoubleSide, ExtrudeBufferGeometry, Mesh, MeshLambertMaterial, PlaneBufferGeometry, Scene, Shape} from "three";
import {Camera} from "three";
import {Raycaster} from "three";
import {Intersection} from "three";
import {Object3D} from "three";
import {MutateMeshFun} from "../../utils/meshes";
import {Module} from "../modules/module";
import {ModuleTypesAll} from "../modules/types";
import {ModuleType} from "../modules/types";
import {ModuleSubtype} from "../modules/types";
import {ModuleSubtypeToModuleFunction} from "../modules/types";
import {ModuleFunction} from "../modules/types";
import {ColorTypeLibrary} from "../colors";
import {ColorType} from "../colors";
import {Lang} from "../../utils/lang";
import {Coords} from "../../utils/lang";
import {MultiMaps} from "../../utils/lang";
import {Maps} from "../../utils/lang";
import {FrontsLibrary} from "../modules/module-functions";
import {Settler} from "./Settler";
import {Obstacle} from "./obstacle";
import {Put} from "./put";
import {PutFurniture} from "./put";
import ObstacleFactory from "./obstacle-factory";

class FloorFactory {
    public static create(width:number, depth:number): Mesh {
        const mesh = new Mesh(
            new PlaneBufferGeometry( width, depth ),
            new MeshLambertMaterial({
                color: 0xbdbdbd,
                side: DoubleSide
            }) );
        mesh.name = "Floor";
        return mesh;
    }
}

export type Slot = [WallName, number]

export type WallName = string

export class Wall {

    static readonly Names:WallName[] = ["A", "B", "C", "D"];

    readonly mesh: Mesh;

    readonly floorWidth = this.width - this.depth;

    constructor(
        readonly name:WallName,
        readonly width:number,
        height:number,
        readonly depth:number,
        readonly translateMesh:MutateMeshFun = Lang.noop,
        readonly rotateMesh:MutateMeshFun = Lang.noop
    ) {
        this.mesh = Wall.createMesh(name, width, height, depth);
        this.rotateMesh(this.mesh);
        this.translateMesh(this.mesh);
        this.mesh.geometry.computeBoundingBox();
    }

    execute(command: Put):void {
        const mesh = command.mesh;

        this.rotateMesh(mesh);
        this.translateMesh(mesh);
        mesh.translateX(-this.mesh.geometry.boundingBox.max.x);

        mesh.translateY(command.tY());
        mesh.translateX(command.tX());
    }

    private static createMesh(name:string, width:number, height:number, depth:number): Mesh {
        const material = new MeshLambertMaterial( {
            color: 0xbdbdbd,
            side: DoubleSide
        } );
        const widthAdjusted = width + depth;
        const rect = new Shape();
        const minx = -widthAdjusted/2;
        const maxx = widthAdjusted/2;

        rect.moveTo( minx, 0 );
        rect.lineTo( minx, height );
        rect.lineTo( maxx, height );
        rect.lineTo( maxx, 0 );
        rect.lineTo( minx, 0 );
        const geom = new ExtrudeBufferGeometry(rect, {
                depth: depth,
                bevelThickness:1,
                bevelSize: 0,
                bevelSegments: 1
            }
        );
        geom.rotateX(Math.PI/2);
        const mesh = new Mesh(
            geom, material
        );
        mesh.name = "Wall" + name;
        mesh.receiveShadow = true;
        return mesh;
    }
}

export class Kitchen extends Observable {
    public readonly modules = new Indexes();
    public readonly revIndexes = new ReverseIndexes();

    private readonly raycaster = new Raycaster();
    private readonly walls: Map<WallName, Wall> = new Map();
    private obstacles: Obstacle[] = [];
    private settler: Settler;
    private floor: Mesh = null;
    constructor(
        private readonly obstacleFactory:ObstacleFactory,
        private readonly moduleLibrary : ModulesFactory,
        private readonly colorLibrary: ColorTypeLibrary,
        private readonly frontsLibrary: FrontsLibrary,
        private readonly scene : Scene
    ) {
        super();
    }
    initFloorAndWalls(
        dimensions: Dimensions3D,
        wallNames: WallName[],
        obstacles: Obstacle[]
    ): void {
        /*
            FIXME
            1. PutObstacle translateY dopiescic
            2. walidacja kuchni jest potrzebna (czy obstacle moze byc w odleglosci 500 od sciany?)
            3. translate resize'owanego mesha do srodka
         */
        this.obstacles = obstacles;
        this.obstacles.forEach(o => o.init(this.obstacleFactory.create(o)));

        this.floor = FloorFactory.create(dimensions.width, dimensions.depth);
        this.scene.add(this.floor);

        const factories: Map<WallName, () => Wall> = WallFactories(dimensions.width, dimensions.depth, dimensions.height);
        wallNames.forEach(name => this.addWall(factories.get(name)()));

        this.fillWallsWithModules();

        this.notify(new Message("LOADED", dimensions));
    }

    private addWall(wall:Wall): void {
        this.walls.set(wall.name, wall);
        this.scene.add(wall.mesh);
    }

    private fillWallsWithModules(): void {
        this.settler = new Settler(this.moduleLibrary);
        this.settler.settle(ModuleTypesAll, this.walls, this.obstacles);
        for (const [i, put] of this.settler.allPuts.entries()) {
            this.putModule(put,i);
        }
        this.settler.obstaclePuts.forEach(put => {
            put.wall.execute(put);
            this.scene.add(put.mesh);
        });
    }

    putModule(command:PutFurniture, index:number) {
        command.wall.execute(command); //wtf
        this.restoreModule([command.wall.name, index], command.module);
    }

    restoreModule(slot:Slot, m: Module) {
        this.scene.add(m.mesh);
        this.index(m, slot); //TODO make Slot a unique index on scene. Check what breaks then
        this.notify(new Message("ADD", [m, Kitchen.label(slot)]));
    }

    private static label([wallName, i]:Slot) {
        return (wallName.charCodeAt(0)*1000)+i;
    }

    private index(module:Module, slot:Slot) {
        this.modules.add(module, slot);
        this.revIndexes.add(module, slot);
    }

    byRaycast(camera: Camera, xy:Coords):Module | null {
        const intersectingMeshes = this.castRay(camera, xy);
        if (intersectingMeshes.length > 0) {
            return this.modules.byId(intersectingMeshes[0].uuid);
        }
        return null;
    }

    private castRay(camera: Camera, xy:Coords): Object3D[] {
        this.raycaster.setFromCamera(xy, camera);
        return this.raycaster.intersectObjects(this.allModuleMeshes()).map((i:Intersection) => i.object);
    };

    private allModuleMeshes(): Mesh[] {
        return this.modules.all().map(_ => _.mesh);
    }

    setColor(module: Module, type: ColorType): void {
        module.color = type;
        module.setColor(this.colorLibrary.get(type));
        module.setFrontTexture(this.frontsLibrary.get(module.moduleFunction, type));
    }

    removeAll(): void {
        this.walls.forEach(wall => this.scene.remove(wall.mesh));
        this.walls.clear();
        this.scene.remove(...this.obstacles.map(o => o.mesh));
        this.obstacles = [];
        this.scene.remove(...this.allModuleMeshes());
        this.modules.clear();
        this.revIndexes.clear();
        this.scene.remove(this.floor);
        this.floor = null;
        this.notify(new Message("REMOVEALL"));
    }

    remove(module:Module): Slot {
        const removedFromSlot = this.revIndexes.slotFor(module);
        this.modules.remove(module, removedFromSlot);
        this.revIndexes.remove(module);
        this.scene.remove(module.mesh);
        this.notify(new Message("REMOVE", module));
        return removedFromSlot;
    }

    setModuleSubtype(module: Module, moduleSubtype: ModuleSubtype): void {
        module.subtype = moduleSubtype;
        this.setModuleFunction(module, ModuleSubtypeToModuleFunction.get(moduleSubtype)[0]);
    }

    setModuleFunction(module: Module, moduleFunction: ModuleFunction): void {
        const [, index] = this.remove(module);
        const newModule = this.moduleLibrary.createForTypes(module.type, module.subtype, moduleFunction, module.resize, module.color);
        this.setColor(newModule, newModule.color);

        const oldPut = this.settler.findCommandByIndex(index);
        const put = new PutFurniture(this.moduleLibrary.slotWidth(), oldPut.wall, oldPut.offset, oldPut.direction, newModule);
        this.putModule(put, index);
        this.notify(new Message("MODULE_CHANGED", newModule));
    }
}

export const WallFactories = (width:number, depth:number, height:number):Map<WallName, () => Wall> => {

    const wallDepth = 8;
    const widthAdjusted = width + wallDepth;
    const depthAdjusted = depth + wallDepth;

    const wallA = () => new Wall("A", widthAdjusted, height, wallDepth
        ,(m:Mesh) => m.translateY((depthAdjusted + wallDepth)/2)
    );

    const wallB = () => new Wall("B", depthAdjusted, height, wallDepth,
        (m:Mesh) => m.translateY((widthAdjusted + wallDepth)/2)
        ,(m:Mesh) => m.rotateZ(-Math.PI / 2)
    );

    const wallC = () => new Wall("C", widthAdjusted, height, wallDepth,
        (m:Mesh) => m.translateY((depthAdjusted + wallDepth)/2),
        (m:Mesh) => m.rotateZ(Math.PI)
    );

    const wallD = () => new Wall("D", depthAdjusted, height, wallDepth,
        (m:Mesh) => m.translateY((widthAdjusted + wallDepth)/2),
        (m:Mesh) => { m.rotateZ(Math.PI / 2) }
    );

    return new Map([["A", wallA], ["B", wallB], ["C", wallC], ["D", wallD]]);
};

export class Dimensions3D {
    constructor(
        public readonly width:number,
        public readonly depth:number,
        public readonly height:number
    ) {}
}

export class Indexes {
    private readonly _byId: Map<string, Module> = new Map();
    private readonly _byType: Map<ModuleType, Module[]> = new Map();
    private readonly _bySlot: Map<string, Map<number, Map<ModuleType, Module>>> = new Map();

    all(): Module[] { return Array.from(this._byId.values()); }

    byId(id: string): Module | undefined { return this._byId.get(id); }

    byType(type: ModuleType): Module[] { return this._byType.get(type); }

    bySlot([wall, index]: Slot): Map<ModuleType, Module> {
        return Maps.getOrDefault(this.byWall(wall), index, new Map());
    }

    private byWall(wall: WallName): Map<number, Map<ModuleType, Module>> {
        return Maps.getOrDefault(this._bySlot, wall, new Map());
    }

    add(module: Module, slot: Slot) {
        this._byId.set(module.id, module);
        this.bySlot(slot).set(module.type, module);
        MultiMaps.set(this._byType, module.type, module);
    }

    remove(module:Module, slot: Slot) {
        this._byId.delete(module.id);
        this.bySlot(slot).delete(module.type);
        MultiMaps.remove(this._byType, module.type, module);
    }

    clear() {
        this._byId.clear();
        this._byType.clear();
        this._bySlot.clear();
    }
}

export class ReverseIndexes {
    private readonly _slotsByModule: Map<Module, Slot> = new Map();

    add(module: Module, slot:Slot) {
        this._slotsByModule.set(module, slot);
    }

    slotFor(module: Module):Slot {
        return this._slotsByModule.get(module);
    }

    clear() {
        this._slotsByModule.clear();
    }

    remove(module:Module) {
        this._slotsByModule.delete(module);
    }
}