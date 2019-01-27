import { Message, Observable } from "../../utils/observable";
import { DoubleSide, ExtrudeBufferGeometry, Mesh, MeshLambertMaterial, PlaneBufferGeometry, Shape, Vector3 } from "three";
import { Raycaster } from "three";
import { Meshes } from "../../utils/meshes";
import { ModuleTypesAll } from "../modules/types";
import { ModuleType } from "../modules/types";
import { Lang } from "../../utils/lang";
class FloorFactory {
    static create(width, depth, rotate) {
        const mesh = new Mesh(new PlaneBufferGeometry(width, depth), new MeshLambertMaterial({
            color: 0xbdbdbd,
            side: DoubleSide
        }));
        mesh.name = "Floor";
        mesh.receiveShadow = true;
        rotate(mesh);
        return mesh;
    }
}
class Wall {
    constructor(name, width, height, translateMesh = Lang.noop, rotateMesh = Lang.noop) {
        this.name = name;
        this.width = width;
        this.height = height;
        this.translateMesh = translateMesh;
        this.rotateMesh = rotateMesh;
        this.wallSlots = Array.from(new Array(50), () => new WallSlot(this));
        this.mesh = Wall.createMesh(name, width, height);
        this.translateMesh(this.mesh);
        this.rotateMesh(this.mesh);
        this.mesh.geometry.computeBoundingBox();
    }
    static createMesh(name, width, height) {
        const material = new MeshLambertMaterial({
            color: 0xbdbdbd,
            side: DoubleSide
        });
        const rect = new Shape();
        const minx = -width / 2;
        const maxx = width / 2;
        rect.moveTo(minx, 0);
        rect.lineTo(minx, height);
        rect.lineTo(maxx, height);
        rect.lineTo(maxx, 0);
        rect.lineTo(minx, 0);
        const mesh = new Mesh(new ExtrudeBufferGeometry(rect, {
            depth: 8,
            bevelThickness: 1,
            bevelSize: 0,
            bevelSegments: 1
        }), material);
        mesh.name = "Wall" + name;
        mesh.receiveShadow = true;
        return mesh;
    }
}
class WallSlot {
    constructor(wall) {
        this.wall = wall;
        this.modulesByTypes = new Map();
    }
    put(module, index, scene) {
        if (this.modulesByTypes.has(module.type)) {
            throw "module already set in this slot";
        }
        this.modulesByTypes.set(module.type, module);
        this.wall.translateMesh(module.mesh);
        module.initRotation();
        this.wall.rotateMesh(module.mesh);
        module.mesh.translateX(module.width / 2 - this.wall.mesh.geometry.boundingBox.max.x);
        module.mesh.translateX(index * module.width);
        module.mesh.translateY(-module.depth / 2 - this.wall.mesh.geometry.boundingBox.max.z);
        scene.add(module.mesh);
    }
    removeAll(scene) {
        Array.from(this.modulesByTypes.keys()).forEach((t) => this.remove(t, scene));
    }
    remove(moduleType, scene) {
        const module = this.modulesByTypes.get(moduleType);
        scene.remove(module.mesh);
        this.modulesByTypes.delete(moduleType);
    }
}
export class Kitchen extends Observable {
    constructor(moduleLibrary, textureLibrary, scene) {
        super();
        this.moduleLibrary = moduleLibrary;
        this.textureLibrary = textureLibrary;
        this.scene = scene;
        this.modules = new Indexes();
        this.raycaster = new Raycaster();
        this.slotWidth = this.moduleLibrary.ofType(ModuleType.STANDING).width;
        this.walls = [];
        this.floor = null;
    }
    initFloorAndWalls(dimensions, wallNames) {
        this.floor = FloorFactory.create(dimensions.width, dimensions.depth, m => m.rotateX(-Math.PI / 2));
        this.scene.add(this.floor);
        const factories = wallsFactories(dimensions.width, dimensions.depth, dimensions.height);
        wallNames.forEach(name => this.addWall(factories.get(name)()));
        this.fillWallsWithModules();
        this.notify(new Message("LOADED", dimensions));
    }
    addWall(wall) {
        this.walls.push(wall);
        this.scene.add(wall.mesh);
    }
    fillWallsWithModules() {
        this.walls.forEach(wall => {
            const wallWidth = Meshes.meshWidthX(wall.mesh);
            const items = Math.floor(wallWidth / this.slotWidth);
            ModuleTypesAll.forEach((type) => this.addModuleToWallSlots(wall, items, type));
        });
    }
    addModuleToWallSlots(wall, count, moduleType) {
        for (let i = 0; i < count; i++) {
            const m = this.moduleLibrary.createModule(moduleType);
            wall.wallSlots[i].put(m, i, this.scene);
            this.modules.add(m);
            this.notify(new Message("ADD", m));
        }
    }
    byRaycast(camera, xy) {
        const intersectingMeshes = this.castRay(camera, xy);
        if (intersectingMeshes.length > 0) {
            return this.modules.byId(intersectingMeshes[0].uuid);
        }
        return null;
    }
    castRay(camera, xy) {
        this.raycaster.setFromCamera(xy, camera);
        return this.raycaster.intersectObjects((this.modules.all()).map(_ => _.mesh)).map((i) => i.object);
    }
    ;
    setFrontTexture(module, type) {
        module.setFrontTexture(this.textureLibrary.get(type));
    }
    setBackTexture(module, type) {
        module.setBackTexture(this.textureLibrary.get(type));
    }
    removeAll() {
        this.walls.forEach((wall) => {
            wall.wallSlots.forEach((slot) => slot.removeAll(this.scene));
            this.scene.remove(wall.mesh);
        });
        this.walls = [];
        this.modules.clear();
        this.scene.remove(this.floor);
        this.notify(new Message("REMOVEALL"));
    }
    setModuleSubtype(module, moduleSubtype) {
        module.subtype = moduleSubtype;
        this.notify(new Message("MODULE_CHANGED", module));
    }
    setModuleFunction(module, moduleFunction) {
        module.moduleFunction = moduleFunction;
        this.notify(new Message("MODULE_CHANGED", module));
    }
}
const wallsFactories = (width, depth, height) => {
    const axisY = new Vector3(0, 1, 0);
    const wallA = () => new Wall("A", width, height, (m) => { m.translateZ(-depth / 2); });
    const wallB = () => new Wall("B", depth, height, (m) => {
        m.translateX(width / 2);
    }, (m) => { m.rotateOnWorldAxis(axisY, -Math.PI / 2); });
    const wallC = () => new Wall("C", width, height, (m) => { m.translateZ(depth / 2); }, (m) => { m.rotateOnWorldAxis(axisY, Math.PI); });
    const wallD = () => new Wall("D", depth, height, (m) => {
        m.translateX(-width / 2);
    }, (m) => { m.rotateOnWorldAxis(axisY, Math.PI / 2); });
    return new Map([["A", wallA], ["B", wallB], ["C", wallC], ["D", wallD]]);
};
export class Dimensions {
    constructor(width, depth, height) {
        this.width = width;
        this.depth = depth;
        this.height = height;
    }
}
export class Indexes {
    constructor() {
        this._byId = new Map();
        this._byType = new Map();
    }
    all() { return Array.from(this._byId.values()); }
    byId(id) { return this._byId.get(id); }
    byType(type) { return this._byType.get(type); }
    add(module) {
        this._byId.set(module.id, module);
        if (this._byType.has(module.type)) {
            this.byType(module.type).push(module);
        }
        else {
            this._byType.set(module.type, [module]);
        }
    }
    clear() {
        this._byId.clear();
        this._byType.clear();
    }
}
