import {flatten, meshWidthX} from "./utils/utils";
import {ModulesLibrary, ModuleType, ModuleTypesAll} from './modules'
import {Observable} from "./utils/observable";
import {DoubleSide, Mesh, MeshLambertMaterial, PlaneBufferGeometry, Scene, Vector3} from "three";

export class Floor {
    public readonly mesh: Mesh;
    constructor(width, depth,  translate = _ => {}, rotate = _ => {}) {
        this.mesh = Floor.createFloor(width, depth);
        translate(this.mesh);
        rotate(this.mesh);
    }
    static createFloor(width, depth): Mesh {
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
    addTo(scene: Scene) {
        scene.add(this.mesh);
    }
}

export class Wall {
    public readonly mesh: Mesh;
    public readonly translateMesh: (_) => any;
    public readonly rotateMesh: (_) => any;
    public readonly wallSlots: WallSlot[];

    constructor(name, width, height, translate = _ => {}, rotate = _ => {}) {
        this.translateMesh = translate;
        this.rotateMesh = rotate;
        this.mesh = Wall.createMesh(name, width, height);
        this.mesh.translateY(height / 2);
        this.translateMesh(this.mesh);
        this.rotateMesh(this.mesh);
        this.mesh.geometry.computeBoundingBox();
        this.wallSlots = Array.from(new Array(50), () => new WallSlot(this));
    }

    name() { return this.mesh.name; }

    static createMesh(name, width, height) {
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
    private wall: Wall;
    private modulesByTypes: Map<ModuleType, any>;
    constructor(wall) {
        this.wall = wall;
        this.modulesByTypes = new Map()
    }
    put(module, index, scene) {
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

    allModules() {
        return Array.from(this.modulesByTypes.values());
    }

    remove(moduleType, scene) {
        const module = this.modulesByTypes.get(moduleType);
        scene.remove(module.mesh);
        this.modulesByTypes.delete(moduleType);
    }
    removeAll(scene) {
        Array.from(this.modulesByTypes.keys()).forEach(t => this.remove(t, scene));
    }
}
export class Kitchen extends Observable {
    private moduleLibrary: ModulesLibrary;
    private readonly scene: Scene;
    private walls: Wall[];
    private floor: Floor;
    constructor(library : ModulesLibrary, scene : Scene) {
        super();
        this.moduleLibrary = library;
        this.scene = scene;

        this.walls = [];
        this.floor = null;
    }

    addWall(wall) {
        this.walls.push(wall);
        this.scene.add(wall.mesh);
    }
    setFloor(floor) {
        this.floor = floor;
        this.floor.addTo(this.scene);
    }

    fillWallWithModules(wall) {
        this.slotWidthF().then(slotWidth => {
            const wallWidth = meshWidthX(wall.mesh);
            const items = Math.floor(wallWidth / slotWidth);
            ModuleTypesAll.forEach(type => this.addModuleToWallSlots(wall, items, type))
        })
    }

    addModuleToWallSlots(wall, count, moduleType) {
        for (let i = 0; i < count; i++) {
            this.moduleLibrary
                .createModule(moduleType)
                .then(m => {
                    wall.wallSlots[i].put(m, i, this.scene);
                    this.notify({ type:"ADD", obj: m});
                });
        }
    }

    allModules() {
        return flatten(flatten(this.walls.map(w => w.wallSlots)).map(s => s.allModules()));
    }

    removeAll() {
        this.walls.forEach(wall => {
            wall.wallSlots.forEach(slot => slot.removeAll(this.scene));
            this.scene.remove(wall.mesh);
        });
        this.walls = [];
        this.notify({type:"REMOVEALL"});
        if (this.floor != null) {
            this.scene.remove(this.floor.mesh);
            this.floor = null;
        }
    }

    slotWidthF() {
        return this.moduleLibrary.ofType(ModuleType.STANDING).then(m => m.width);
    }

}

export function wallsFactories(width, depth, height) {

    const axisY = new Vector3(0, 1, 0);

    const wallA = () => new Wall("A", width, height);

    const wallB = () => new Wall("B", depth, height,
        m => {
            m.translateX(width/2);
            m.translateZ(depth/2);
        },
        m => m.rotateOnWorldAxis(axisY, - Math.PI / 2)
    );

    const wallC = () => new Wall("C", width, height,
        m => m.translateZ(depth),
        m => m.rotateZ(Math.PI)
    );

    const wallD = () => new Wall("D", depth, height,
        m => {
            m.translateX(-width/2);
            m.translateZ(depth/2);
        },
        m => m.rotateOnWorldAxis(axisY, Math.PI / 2)
    );

    return new Map([["A", wallA], ["B", wallB], ["C", wallC], ["D", wallD]]);
}