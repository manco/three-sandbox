import {meshWidthX} from "./utils.js";
import {ModuleTypes, ModuleTypesAll} from './modules.js'

export class Floor {
    constructor() {
        const width = 1200;
        this.mesh = Floor.createFloor(width);
    }
    static createFloor(width) {
        const material = new THREE.MeshPhongMaterial( {
            color: 0x6e6b72,
            shininess: 50,
            specular: 0x111111
        } );
        const g = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( width, width ), material );
        g.rotateX( - Math.PI / 2 );
        g.name = "Floor";
        g.receiveShadow = true;
        return g;
    }
    addTo(scene) {
        scene.add(this.mesh);
    }
}
export class Wall {

    constructor(name, width, height) {
        this.mesh = Wall.createMesh(name, width, height);
        this.wallSlots = Array.from(new Array(10), () => new WallSlot(this));
    }

    name() { return this.mesh.name; }

    static createMesh(name, width, height) {
        const material = new THREE.MeshPhongMaterial( {
            color: 0xa0adaf,
            shininess: 50,
            opacity: 0.3,
            transparent: true,
            specular: 0x111111,
            side: THREE.DoubleSide
        } );
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), material );
        mesh.position.set(0, height / 2, 0);
        mesh.name = "Wall" + name;
        mesh.receiveShadow = true;
        return mesh;
    }
}

/**
 * Need to know the original wall! (bbox.min.x, rotation etc...)
 */
class WallSlot {
    constructor(wall) {
        this.wall = wall;
        this.modulesByTypes = new Map()
    }
    alreadyContains(moduleType) {
        return this.modulesByTypes.has(moduleType);
    }
    put(module, index, scene) {
        if (this.alreadyContains(module.type)) {
            throw "module already set in this slot"
        }
        this.modulesByTypes.set(module.type, module);
        module.mesh.position.x = index * module.width;
        scene.add(module.mesh);
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
export class Kitchen {
    constructor(library, scene) {
        this.moduleLibrary = library;
        this.scene = scene;

        this.walls = [];
    }

    addModuleToWallASlot(moduleType, slotIndex) {
        this.moduleLibrary
            .createModule(moduleType)
            .then(m => this.walls[0].wallSlots[slotIndex].put(m, slotIndex, this.scene));
    }
    addWall(wall) {
        this.walls.push(wall);
        this.scene.add(wall.mesh);
    }

    findWallByName(name) {
        return this.walls.find(w => w.name() === ("Wall" + name))
    }

    // removeModule(moduleType) {
    //     const occupiedSlotIndex = this.walls[0].wallSlots.findIndex(s => s.alreadyContains(moduleType));
    //     if (occupiedSlotIndex === -1) {
    //         console.log("no occupied slots")
    //     } else {
    //         this.walls[0].wallSlots[occupiedSlotIndex].remove(moduleType, this.scene);
    //     }
    // }

    fillWallWithModules(wall) {
        if (wall.mesh.name !== "WallA") {
            console.warn("sorry, only Wall A supported for now:)");
            return;
        }
        this.slotWidthF().then(slotWidth => {
            const items = meshWidthX(wall.mesh) / slotWidth;
            for (let i = 0; i < items; i++) {
                ModuleTypesAll.forEach(type => this.addModuleToWallASlot(type, i))
            }
        })
    }

    removeAll() {
        this.walls.forEach(wall => {
            wall.wallSlots.forEach(slot => slot.removeAll(this.scene));
            this.scene.remove(wall.mesh);
        });
        this.walls = [];
    }

    slotWidthF() {
        return this.moduleLibrary.ofType(ModuleTypes.STANDING).then(m => m.width);
    }

}