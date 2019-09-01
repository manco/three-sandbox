import ModulesFactory from '../modules/modules-factory'
import {Message, Observable} from "../../utils/observable";
import {DoubleSide, ExtrudeBufferGeometry, Mesh, MeshLambertMaterial, PlaneBufferGeometry, Scene, Shape, Vector3} from "three";
import {Camera} from "three";
import {Raycaster} from "three";
import {Intersection} from "three";
import {Object3D} from "three";
import {MutateMeshFun} from "../../utils/meshes";
import {Module} from "../modules/module";
import {ModuleTypesAll} from "../modules/types";
import {ModuleType} from "../modules/types";
import {ModuleSubtype} from "../modules/types";
import {ColorTypeLibrary} from "../colors";
import {ColorType} from "../colors";
import {Lang} from "../../utils/lang";
import {Coords} from "../../utils/lang";
import {MultiMaps} from "../../utils/lang";
import {ModuleFunction} from "../modules/module-functions";
import {FrontsLibrary} from "../modules/module-functions";
import {ModuleSubtypeToModuleFunction} from "../modules/module-functions";
import {Maps} from "../../utils/lang";

class FloorFactory {
    public static create(width:number, depth:number, rotate:MutateMeshFun): Mesh {
        const mesh = new Mesh(
            new PlaneBufferGeometry( width, depth ),
            new MeshLambertMaterial({
                color: 0xbdbdbd,
                side: DoubleSide
            }) );
        mesh.name = "Floor";
        mesh.receiveShadow = true;
        rotate(mesh);
        return mesh;
    }
}

class Wall {
    readonly mesh: Mesh;

    constructor(
        readonly name:string,
        public readonly width:number,
        height:number,
        readonly translateMesh:MutateMeshFun = Lang.noop,
        readonly rotateMesh:MutateMeshFun = Lang.noop
    ) {
        this.mesh = Wall.createMesh(name, width, height);
        this.translateMesh(this.mesh);
        this.rotateMesh(this.mesh);
        this.mesh.geometry.computeBoundingBox();
    }
    put(module:Module, index:number, scene:Scene): void {
        this.translateMesh(module.mesh);
        module.initRotation();
        this.rotateMesh(module.mesh);
        module.mesh.translateX(module.width/2 - this.mesh.geometry.boundingBox.max.x);
        module.mesh.translateX(index * module.width);
        module.mesh.translateY(- module.depth/2 - this.mesh.geometry.boundingBox.max.z);
        scene.add(module.mesh);
    }

    private static createMesh(name:string, width:number, height:number): Mesh {
        const material = new MeshLambertMaterial( {
            color: 0xbdbdbd,
            side: DoubleSide
        } );
        const rect = new Shape();
        const minx = -width/2;
        const maxx = width/2;
        rect.moveTo( minx, 0 );
        rect.lineTo( minx, height );
        rect.lineTo( maxx, height );
        rect.lineTo( maxx, 0 );
        rect.lineTo( minx, 0 );
        const mesh = new Mesh(
            new ExtrudeBufferGeometry(rect, {
                depth: 8,
                bevelThickness:1,
                bevelSize: 0,
                bevelSegments: 1
            }
        ), material
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
    private walls: Wall[] = [];
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
        this.floor = FloorFactory.create(dimensions.width, dimensions.depth, m => m.rotateX(- Math.PI / 2 ) );
        this.scene.add(this.floor);
        const factories = wallsFactories(dimensions.width, dimensions.depth, dimensions.height);
        wallNames.forEach(name => this.addWall(factories.get(name)()));
        this.fillWallsWithModules();
        this.notify(new Message("LOADED", dimensions));
    }

    private addWall(wall:Wall): void {
        this.walls.push(wall);
        this.scene.add(wall.mesh);
    }

    private fillWallsWithModules(): void {
        const slotWidth = this.moduleLibrary.slotWidth();
        this.walls.forEach(wall => {
            const items = Math.floor(wall.width / slotWidth);
            ModuleTypesAll.forEach((type) => this.addModuleToWallSlots(wall, items, type))
        });
    }

    private addModuleToWallSlots(wall:Wall, count:number, moduleType:ModuleType): void {
        for (let i = 0; i < count; i++) {
            const m = this.moduleLibrary.createForType(moduleType);
            this.addModule(wall, m, i);
        }
    }

    private addModule(wall: Wall, m: Module, i: number) {
        wall.put(m, i, this.scene);
        this.modules.add(m, [wall, i]);
        this.revIndexes.add(m, wall, i);
        this.notify(new Message("ADD", [m, (wall.name.charCodeAt(0)*1000)+i]));
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
        return this.raycaster.intersectObjects((this.modules.all()).map(_ => _.mesh)).map((i:Intersection) => i.object);
    };

    setColor(module: Module, type: ColorType): void {
        module.color = type;
        module.setColor(this.colorLibrary.get(type));
        module.setFrontTexture(this.frontsLibrary.get(module.moduleFunction, type));
    }

    removeAll(): void {
        this.walls.forEach(wall => this.scene.remove(wall.mesh));
        this.walls = [];
        this.scene.remove(...this.modules.all().map(m => m.mesh));
        this.modules.clear();
        this.revIndexes.clear();
        this.scene.remove(this.floor);
        this.floor = null;
        this.notify(new Message("REMOVEALL"));
    }

    remove(module:Module): [Wall, number] {
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
        const [wall, index] = this.remove(module);
        const newModule = this.moduleLibrary.createForTypes(module.type, module.subtype, moduleFunction, module.color);
        this.setColor(newModule, newModule.color);
        this.addModule(wall, newModule, index);
        this.notify(new Message("MODULE_CHANGED", newModule));
    }
}

const wallsFactories = (width:number, depth:number, height:number):Map<string, () => Wall> => {

    const axisY = new Vector3(0, 1, 0);

    const wallA = ():Wall => new Wall("A", width, height,
        (m:Mesh) => { m.translateZ(-depth/2) }
        );

    const wallB = ():Wall => new Wall("B", depth, height,
        (m:Mesh) => {
            m.translateX(width/2);
        },
        (m:Mesh) => { m.rotateOnWorldAxis(axisY, - Math.PI / 2) }
    );

    const wallC = ():Wall => new Wall("C", width, height,
        (m:Mesh) => { m.translateZ(depth/2) },
        (m:Mesh) => { m.rotateOnWorldAxis(axisY, Math.PI) }
    );

    const wallD = ():Wall => new Wall("D", depth, height,
        (m:Mesh) => {
            m.translateX(-width/2);
        },
        (m:Mesh) => { m.rotateOnWorldAxis(axisY, Math.PI / 2) }
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
    private readonly _bySlot: Map<Wall, Map<number, Map<ModuleType, Module>>> = new Map();

    all(): Module[] { return Array.from(this._byId.values()); }

    byId(id: string): Module | undefined { return this._byId.get(id); }

    byType(type: ModuleType): Module[] { return this._byType.get(type); }

    bySlot([wall, index]: [Wall, number]): Map<ModuleType, Module> {
        return Maps.getOrDefault(this.byWall(wall), index, new Map());
    }

    private byWall(wall: Wall) {
        return Maps.getOrDefault(this._bySlot, wall, new Map());
    }

    add(module: Module, slot: [Wall, number]) {
        this._byId.set(module.id, module);
        this.bySlot(slot).set(module.type, module);
        MultiMaps.set(this._byType, module.type, module);
    }

    remove(module:Module, slot: [Wall, number]) {
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
    private readonly _slotsByModule: Map<Module, [Wall, number]> = new Map();

    add(module: Module, wall: Wall, index: number) {
        this._slotsByModule.set(module, [wall, index]);
    }

    slotFor(module: Module):[Wall, number] {
        return this._slotsByModule.get(module);
    }

    clear() {
        this._slotsByModule.clear();
    }

    remove(module:Module) {
        this._slotsByModule.delete(module);
    }
}