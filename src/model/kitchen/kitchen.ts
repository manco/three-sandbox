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
import {ModuleTypeToSubtype} from "../modules/types";
import {ColorTypeLibrary} from "../colors";
import {ColorType} from "../colors";
import {Lang} from "../../utils/lang";
import {Coords} from "../../utils/lang";
import {MultiMaps} from "../../utils/lang";
import {Maps} from "../../utils/lang";
import {ModuleFunction} from "../modules/module-functions";
import {FrontsLibrary} from "../modules/module-functions";
import {ModuleSubtypeToModuleFunction} from "../modules/module-functions";
import {ModuleTypeCorners} from "../modules/module-functions";
import {Settler} from "./Settler";
import {Settlement} from "./Settler";
import {Direction} from "./Settler";

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

type Slot = [string, number]

export class Wall {
    readonly mesh: Mesh;

    readonly floorWidth = this.width - this.depth;

    constructor(
        readonly name:string,
        readonly width:number,
        height:number,
        private readonly depth:number,
        readonly translateMesh:MutateMeshFun = Lang.noop,
        readonly rotateMesh:MutateMeshFun = Lang.noop
    ) {
        this.mesh = Wall.createMesh(name, width, height, depth);
        this.rotateMesh(this.mesh);
        this.translateMesh(this.mesh);
        this.mesh.geometry.computeBoundingBox();
    }

    put(module:Module, index:number, settlement:Settlement, slotWidth:number): void {

        this.rotateMesh(module.mesh);
        this.translateMesh(module.mesh);

        module.mesh.translateX(-this.mesh.geometry.boundingBox.max.x);
        module.mesh.translateY(-this.depth);

        module.mesh.translateX(slotWidth/2);

        const tY = module.isCorner() ? slotWidth : module.depth;
        module.mesh.translateY(- tY/2);

        const offset = settlement.modulesOffsetForIndex.get(this.name)(index);
        module.mesh.translateX(offset);

        const direction = settlement.fillDirection.get(this.name);
        if (direction === Direction.TO_LEFT) module.mesh.translateX(this.width - slotWidth);

        //don't know how does it help
        if (direction === Direction.TO_RIGHT) module.mesh.translateX(this.depth);
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
    private walls: Map<string, Wall> = new Map();
    private settlement: Settlement = null;
    private floor: Mesh = null;
    constructor(
        private readonly moduleLibrary : ModulesFactory,
        private readonly colorLibrary: ColorTypeLibrary,
        private readonly frontsLibrary: FrontsLibrary,
        private readonly scene : Scene
    ) {
        super();
    }

    initFloorAndWalls(
        dimensions: Dimensions,
        wallNames: string[]
    ): void {
        this.floor = FloorFactory.create(dimensions.width, dimensions.depth);
        this.scene.add(this.floor);

        const factories: Map<string, () => Wall> = wallsFactories(dimensions.width, dimensions.depth, dimensions.height);
        wallNames.forEach(name => this.addWall(factories.get(name)()));

        this.settlement = this.settle();
        this.fillWallsWithModules();

        this.notify(new Message("LOADED", dimensions));
    }

    private addWall(wall:Wall): void {
        this.walls.set(wall.name, wall);
        this.scene.add(wall.mesh);
    }

    private fillWallsWithModules(): void {
        ModuleTypesAll.forEach(type => {
            this.settlement.corners.forEach(corner => {
                const m = this.moduleLibrary.createForTypes(
                    type,
                    ModuleTypeToSubtype.get(type)[0],
                    ModuleTypeCorners.get(type)
                );
                this.addModule([corner.left, 0], m);
            });
            this.walls.forEach(wall => {
                    for (let i = 1; i <= this.settlement.modulesCount.get(wall.name); i++) {
                        const m = this.moduleLibrary.createForType(type);
                        this.addModule([wall.name, i], m);
                    }
            });
            //detect holes, candidates to expand
            this.walls.forEach( wall => {
                const maxIndex = this.settlement.modulesCount.get(wall.name);
                const moduleNextToHole = this.modules.bySlot([wall.name, maxIndex]).get(type);
                if (moduleNextToHole !== undefined) {
                    const holeSize = this.settlement.wallHoleSize.get(wall.name);
                    const factor = (holeSize / moduleNextToHole.width);
                    moduleNextToHole.mesh.geometry.scale(1 + factor, 1, 1);
                    moduleNextToHole.mesh.geometry.computeBoundingBox();
                    const signum = this.settlement.fillDirection.get(wall.name) === Direction.TO_LEFT ? -1 : 1;
                    moduleNextToHole.mesh.translateX(signum * holeSize/2);
                    moduleNextToHole.recalculateDimensions();
                }
            })
        });

    }

    addModule(slot:Slot, m: Module) {

        const [wallName, i] = slot;
        const wall = this.walls.get(wallName);
        wall.put(m, i, this.settlement, this.moduleLibrary.slotWidth());

        this.scene.add(m.mesh);
        this.index(m, slot);
        this.notify(new Message("ADD", [m, Kitchen.label(slot)]));
    }

    restoreModule(slot:Slot, m: Module) {
        this.scene.add(m.mesh);
        this.index(m, slot);
        this.notify(new Message("ADD", [m, Kitchen.label(slot)]));
    }

    private static label([wallName, i]:Slot) {
        return (wallName.charCodeAt(0)*1000)+i;
    }

    private index(module:Module, slot:Slot) {
        this.modules.add(module, slot);
        this.revIndexes.add(module, slot);
    }

    private settle() {
        return new Settler(this.moduleLibrary.slotWidth(), this.moduleLibrary.cornerWidth()).settle(this.walls);
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
        this.walls = new Map();
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
        const slot = this.remove(module);
        const newModule = this.moduleLibrary.createForTypes(module.type, module.subtype, moduleFunction, module.color);
        this.setColor(newModule, newModule.color);
        this.addModule(slot, newModule);
        this.notify(new Message("MODULE_CHANGED", newModule));
    }
}

export const wallsFactories = (width:number, depth:number, height:number):Map<string, () => Wall> => {

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

export class Dimensions {
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

    private byWall(wall: string): Map<number, Map<ModuleType, Module>> {
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