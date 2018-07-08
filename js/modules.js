import {PromisingLoader} from "./utils/loader.js";
import {meshWidthX, meshDepthY} from "./utils/utils.js";

export class Module {
    constructor(mesh, type, width, depth, rotateFun) {
        this.mesh = mesh;
        this.type = type;
        this.width = width;
        this.depth = depth;
        this.rotateFun = rotateFun;
    }
    initRotation() {
        this.rotateFun(this.mesh);
    }
    clone() {
        const cloned = new Module(this.mesh.clone(), this.type, this.width, this.depth, this.rotateFun);
        cloned.mesh.material = new THREE.MeshLambertMaterial();
        return cloned;
    }
}

export class ModulesLibrary {
    constructor() {
        this.loader = new PromisingLoader();
        this.scale = 3;
        this.prototypes = null;
    }
    loadPrototypes(definitions) {
        if (this.prototypes == null) {
            this.prototypes = Promise.all(
                definitions.map(
                    d =>
                        this.loader.loadSingleMesh(d.url)
                            .then(m => {
                                this.initMesh(m);
                                return new Module(
                                    m,
                                    d.type,
                                    this.scale * meshWidthX(m),
                                    this.scale * meshDepthY(m),
                                    mm => mm.rotateX(-Math.PI / 2)
                                );
                            })
                )
            );
        } else {
            throw "sorry, prototypes already loaded or being loaded";
        }
    }

    createModule(type) {
        return this.ofType(type)
            .then(m => m.clone());
    }

    ofType(type) {
        return this.prototypes
            .then(modules => modules.find(m => type === m.type));
    }

    initMesh(m) {
        m.castShadow = true;
        m.receiveShadow = true;
        m.scale.multiplyScalar(this.scale);
        m.geometry.computeBoundingBox();
    }
}

export class ModuleType {
    static get STANDING() { return "STANDING" };
    static get TABLETOP() { return "TABLETOP" };
    static get HANGING() { return "HANGING" };
}

export const ModuleTypesAll = [ModuleType.STANDING, ModuleType.TABLETOP, ModuleType.HANGING];