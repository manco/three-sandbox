import ModulesLibrary from '../modules/modules-library'
import {Message, Observable} from "../../utils/observable";
import {DoubleSide, ExtrudeBufferGeometry, Mesh, MeshLambertMaterial, PlaneBufferGeometry, Scene, Shape, Vector3} from "three";
import {Camera} from "three";
import {Raycaster} from "three";
import {Intersection} from "three";
import {Object3D} from "three";
import {Meshes, MutateMeshFun} from "../../utils/meshes";
import {Module} from "../modules/module";
import {ModuleTypesAll} from "../modules/types";
import {ModuleType} from "../modules/types";
import {TexturesLibrary} from "../textures";
import {TextureType} from "../textures";
import {Lang} from "../../utils/lang";
import {Coords} from "../../utils/lang";
import {ModuleSubtype} from "../modules/types";
import {ModuleFunction} from "../modules/module-functions";

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
    readonly wallSlots: WallSlot[] = Array.from(new Array(50), () => new WallSlot(this));

    constructor(
        readonly name:string,
        readonly width:number,
        readonly height:number,
        readonly translateMesh:MutateMeshFun = Lang.noop,
        readonly rotateMesh:MutateMeshFun = Lang.noop
    ) {
        this.mesh = Wall.createMesh(name, width, height);
        this.translateMesh(this.mesh);
        this.rotateMesh(this.mesh);
        this.mesh.geometry.computeBoundingBox();
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

class WallSlot {
    private readonly modulesByTypes: Map<ModuleType, Module> = new Map();
    constructor(private readonly wall:Wall) {}

    put(module:Module, index:number, scene:Scene): void {
        if (this.modulesByTypes.has(module.type)) {
            throw "module already set in this slot"
        }
        this.modulesByTypes.set(module.type, module);

        this.wall.translateMesh(module.mesh);
        module.initRotation();
        this.wall.rotateMesh(module.mesh);
        module.mesh.translateX(module.width/2 - this.wall.mesh.geometry.boundingBox.max.x);
        module.mesh.translateX(index * module.width);
        module.mesh.translateY(- module.depth/2 - this.wall.mesh.geometry.boundingBox.max.z);
        scene.add(module.mesh);
    }

    removeAll(scene:Scene): void {
        Array.from(this.modulesByTypes.keys()).forEach((t) => this.remove(t, scene));
    }

    private remove(moduleType:ModuleType, scene:Scene): void {
        const module = this.modulesByTypes.get(moduleType);
        scene.remove(module.mesh);
        this.modulesByTypes.delete(moduleType);
    }
}

export class Kitchen extends Observable {
    public readonly modules = new Indexes();
    private readonly raycaster = new Raycaster();
    private readonly slotWidth = this.moduleLibrary.ofType(ModuleType.STANDING).width;
    private walls: Wall[] = [];
    private floor: Mesh = null;
    constructor(
        private readonly moduleLibrary : ModulesLibrary,
        private readonly textureLibrary: TexturesLibrary,
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
        this.walls.forEach(wall => {
            const wallWidth = Meshes.meshWidthX(wall.mesh);
            const items = Math.floor(wallWidth / this.slotWidth);
            ModuleTypesAll.forEach((type) => this.addModuleToWallSlots(wall, items, type))
        });
    }

    private addModuleToWallSlots(wall:Wall, count:number, moduleType:ModuleType): void {
        for (let i = 0; i < count; i++) {
            const m = this.moduleLibrary.createModule(moduleType);
            wall.wallSlots[i].put(m, i, this.scene);
            this.modules.add(m);
            this.notify(new Message("ADD", m));
        }
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

    setFrontTexture(module: Module, type: TextureType): void {
        module.setFrontTexture(this.textureLibrary.get(type));
    }

    setBackTexture(module: Module, type: TextureType): void {
        module.setBackTexture(this.textureLibrary.get(type));
    }

    removeAll(): void {
        this.walls.forEach((wall:Wall) => {
            wall.wallSlots.forEach((slot:WallSlot) => slot.removeAll(this.scene));
            this.scene.remove(wall.mesh);
        });
        this.walls = [];
        this.modules.clear();
        this.scene.remove(this.floor);
        this.notify(new Message("REMOVEALL"));
    }


    setModuleSubtype(module: Module, moduleSubtype: ModuleSubtype): void {
        module.subtype = moduleSubtype;
        this.notify(new Message("MODULE_CHANGED", module));
    }

    setModuleFunction(module: Module, moduleFunction: ModuleFunction): void {
        module.moduleFunction = moduleFunction;
        this.notify(new Message("MODULE_CHANGED", module));
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

    all(): Module[] { return Array.from(this._byId.values()); }

    byId(id: string): Module | undefined { return this._byId.get(id); }

    byType(type: ModuleType): Module[] { return this._byType.get(type); }

    add(module: Module) {
        this._byId.set(module.id, module);

        if (this._byType.has(module.type)) {
            this.byType(module.type).push(module);
        } else {
            this._byType.set(module.type, [module]);
        }
    }

    clear() {
        this._byId.clear();
        this._byType.clear();
    }

}