import {PromisingLoader} from "./loader.js";
import {makeEnum, meshWidthX} from "./utils.js";

export class Module {
    constructor(mesh, type, width) {
        this.mesh = mesh;
        this.type = type;
        this.width = width;
    }
    clone() {
        return new Module(this.mesh.clone(), this.type, this.width);
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
                                return new Module(m, d.type, this.scale * meshWidthX(m))
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
            .then(modules => modules.find(m => m.type === type));
    }

    initMesh(m) {
        m.rotateX(-Math.PI / 2);
        m.position.set(0, 0, 0);
        m.castShadow = true;
        m.receiveShadow = true;
        m.scale.multiplyScalar(this.scale);
        m.geometry.computeBoundingBox();
    }
}
export const ModuleTypes = makeEnum(["STANDING", "TABLETOP", "HANGING"]);
export const ModuleTypesAll = [ModuleTypes.STANDING, ModuleTypes.TABLETOP, ModuleTypes.HANGING];