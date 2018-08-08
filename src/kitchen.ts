import {Module, ModulesLibrary, ModuleType, ModuleTypesAll} from './modules'
import {Message, Observable} from "./utils/observable";
import {DoubleSide, Mesh, MeshLambertMaterial, PlaneBufferGeometry, Scene, Vector3} from "three";
import {MutateMeshFun, Utils} from "./utils/utils";

export class Floor {
    readonly mesh: Mesh;
    constructor(width:number, depth:number, translate:MutateMeshFun = _ => {}, rotate:MutateMeshFun = _ => {}) {
        this.mesh = Floor.createFloor(width, depth);
        translate(this.mesh);
        rotate(this.mesh);
    }
    static createFloor(width:number, depth:number): Mesh {
        const material = new MeshLambertMaterial( {
            color: 0xbdbdbd,
            side: DoubleSide
        } );
        const g = new Mesh(
            new PlaneBufferGeometry( width, depth ), material );
        g.name = "Floor";
        g.receiveShadow = true;
        return g;
    }
    addTo(scene: Scene): void {
        scene.add(this.mesh);
    }
}

export class Wall {
    readonly mesh: Mesh;
    readonly wallSlots: WallSlot[] = Array.from(new Array(50), () => new WallSlot(this));

    constructor(name:string, width:number, height:number, readonly translateMesh:(_:Mesh) => void = (_:Mesh):void => {}, readonly rotateMesh:(_:Mesh) => void = (_:Mesh):void => {}) {
        this.mesh = Wall.createMesh(name, width, height);
        this.mesh.translateY(height / 2);
        this.translateMesh(this.mesh);
        this.rotateMesh(this.mesh);
        this.mesh.geometry.computeBoundingBox();
    }

    name(): string { return this.mesh.name; }

    static createMesh(name:string, width:number, height:number): Mesh {
        const material = new MeshLambertMaterial( {
            color: 0xbdbdbd,
            side: DoubleSide
        } );
        const mesh = new Mesh(new PlaneBufferGeometry(width, height), material );
        mesh.name = "Wall" + name;
        mesh.receiveShadow = true;
        return mesh;
    }
}

class WallSlot {
    private modulesByTypes: Map<string, Module> = new Map();
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

    remove(moduleType:string, scene:Scene): void {
        const module = this.modulesByTypes.get(moduleType);
        scene.remove(module.mesh);
        this.modulesByTypes.delete(moduleType);
    }
    removeAll(scene:Scene): void {
        Array.from(this.modulesByTypes.keys()).forEach((t:string) => this.remove(t, scene));
    }
}
export class Kitchen extends Observable {
    private walls: Wall[] = [];
    private floor: Floor = null;
    constructor(private readonly moduleLibrary : ModulesLibrary, private readonly scene : Scene) {
        super();
    }

    addWall(wall:Wall): void {
        this.walls.push(wall);
        this.scene.add(wall.mesh);
    }
    setFloor(floor:Floor): void {
        this.floor = floor;
        this.floor.addTo(this.scene);
    }

    fillWallWithModules(wall:Wall): void {
        this.slotWidthF().then((slotWidth :number)=> {
            const wallWidth = Utils.meshWidthX(wall.mesh);
            const items = Math.floor(wallWidth / slotWidth);
            ModuleTypesAll.forEach((type:string) => this.addModuleToWallSlots(wall, items, type))
        })
    }

    addModuleToWallSlots(wall:Wall, count:number, moduleType:string): void {
        for (let i = 0; i < count; i++) {
            this.moduleLibrary
                .createModule(moduleType)
                .then((m:Module) => {
                    wall.wallSlots[i].put(m, i, this.scene);
                    this.notify({ type:"ADD", obj: m});
                });
        }
    }

    allModules(): Module[] {
        return Utils.flatten(Utils.flatten(this.walls.map((w:Wall) => w.wallSlots)).map((s:WallSlot) => s.allModules()));
    }

    removeAll(): void {
        this.walls.forEach((wall:Wall) => {
            wall.wallSlots.forEach((slot:WallSlot) => slot.removeAll(this.scene));
            this.scene.remove(wall.mesh);
        });
        this.walls = [];
        this.notify(new Message("REMOVEALL"));
        if (this.floor != null) {
            this.scene.remove(this.floor.mesh);
            this.floor = null;
        }
    }

    slotWidthF(): Promise<number> {
        return this.moduleLibrary.ofType(ModuleType.STANDING).then((m:Module) => m.width);
    }

}

export const wallsFactories = (width:number, depth:number, height:number):Map<string, () => Wall> => {

    const axisY = new Vector3(0, 1, 0);

    const wallA = ():Wall => new Wall("A", width, height);

    const wallB = ():Wall => new Wall("B", depth, height,
        (m:Mesh):void => {
            m.translateX(width/2);
            m.translateZ(depth/2);
        },
        (m:Mesh):void => { m.rotateOnWorldAxis(axisY, - Math.PI / 2) }
    );

    const wallC = ():Wall => new Wall("C", width, height,
        (m:Mesh):void => { m.translateZ(depth) },
        (m:Mesh):void => { m.rotateZ(Math.PI) }
    );

    const wallD = ():Wall => new Wall("D", depth, height,
        (m:Mesh):void => {
            m.translateX(-width/2);
            m.translateZ(depth/2);
        },
        (m:Mesh):void => { m.rotateOnWorldAxis(axisY, Math.PI / 2) }
    );

    return new Map([["A", wallA], ["B", wallB], ["C", wallC], ["D", wallD]]);
};