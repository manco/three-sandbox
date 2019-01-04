import ModulesLibrary from '../modules/modules-library'
import {Message, Observable} from "../../utils/observable";
import {DoubleSide, ExtrudeBufferGeometry, Mesh, MeshLambertMaterial, PlaneBufferGeometry, Scene, Shape, Vector3} from "three";
import {Meshes, MutateMeshFun} from "../../utils/meshes";
import {Module} from "../modules/module";
import {ModuleTypesAll} from "../modules/types";
import {ModuleType} from "../modules/types";
import {TexturesLibrary} from "../textures";
import {TextureType} from "../textures";
import {Lang} from "../../utils/lang";

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

    allModules(): Module[] {
        return Array.from(this.modulesByTypes.values());
    }

    remove(moduleType:ModuleType, scene:Scene): void {
        const module = this.modulesByTypes.get(moduleType);
        scene.remove(module.mesh);
        this.modulesByTypes.delete(moduleType);
    }
    removeAll(scene:Scene): void {
        Array.from(this.modulesByTypes.keys()).forEach((t) => this.remove(t, scene));
    }
}
export class Kitchen extends Observable {
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
        width: number,
        height: number,
        depth: number,
        wallNames: string[]
    ): Promise<void> {
        this.floor = FloorFactory.create(width, depth, m => m.rotateX(- Math.PI / 2 ) );
        this.scene.add(this.floor);
        const factories = wallsFactories(width, depth, height);
        wallNames.forEach(name => this.addWall(factories.get(name)()));
        return this.fillWallsWithModules().then(() => this.notify(new Message("LOADED")));
    }

    private addWall(wall:Wall): void {
        this.walls.push(wall);
        this.scene.add(wall.mesh);
    }

    private fillWallsWithModules(): Promise<void> {
        return this.slotWidthF().then((slotWidth :number)=> {
            this.walls.forEach(wall => {
                const wallWidth = Meshes.meshWidthX(wall.mesh);
                const items = Math.floor(wallWidth / slotWidth);
                ModuleTypesAll.forEach((type) => this.addModuleToWallSlots(wall, items, type))
            });
        })
    }

    private addModuleToWallSlots(wall:Wall, count:number, moduleType:ModuleType): void {
        for (let i = 0; i < count; i++) {
            this.moduleLibrary
                .createModule(moduleType)
                .then((m:Module) => {
                    wall.wallSlots[i].put(m, i, this.scene);
                    this.notify(new Message("ADD", m));
                });
        }
    }

    allModules(): Module[] {
        return Lang.flatten(Lang.flatten(this.walls.map((w:Wall) => w.wallSlots)).map((s:WallSlot) => s.allModules()));
    }

    setTexture(module: Module, type: TextureType): void {
        module.setTexture(this.textureLibrary.get(type));
    }

    removeAll(): void {
        this.walls.forEach((wall:Wall) => {
            wall.wallSlots.forEach((slot:WallSlot) => slot.removeAll(this.scene));
            this.scene.remove(wall.mesh);
        });
        this.walls = [];
        this.scene.remove(this.floor);
        this.notify(new Message("REMOVEALL"));
    }

    private slotWidthF(): Promise<number> {
        return this.moduleLibrary.ofType(ModuleType.STANDING).then((m:Module) => m.width);
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