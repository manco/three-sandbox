import {PromisingLoader} from "../../utils/loader";
import {Utils} from "../../utils/utils";
import {Mesh} from "three";
import {Module} from "./module";
import {ModuleDefinition} from "./module";
import {ModuleSubtypesOfTypes} from "./types";
import {ModuleType} from "./types";

export class ModulesLibrary {
    private loader: PromisingLoader = new PromisingLoader();
    private readonly scale: number = 3;
    private prototypes: Promise<Module[]> = null;

    loadPrototypes(definitions: ModuleDefinition[]):void {
        if (this.prototypes === null) {
            this.prototypes = Promise.all(
                definitions.map(
                    (d:ModuleDefinition) =>
                        this.loader.loadSingleMesh(d.url)
                            .then((m:Mesh) => {
                                this.initMesh(m);
                                return new Module(
                                    m,
                                    d.type,
                                    ModuleSubtypesOfTypes.get(d.type)[0],
                                    this.scale * Utils.meshWidthX(m),
                                    this.scale * Utils.meshDepthY(m),
                                    (mm:Mesh):void => { mm.rotateX(-Math.PI / 2); }
                                );
                            })
                )
            );
        } else {
            throw "sorry, prototypes already loaded or being loaded";
        }
    }

    createModule(type:ModuleType):Promise<Module> {
        return this.ofType(type)
            .then((m:Module) => m.clone());
    }

    ofType(type:ModuleType):Promise<Module> {
        return this.prototypes
            .then((modules:Module[]) => modules.find((m:Module) => type === m.type));
    }

    initMesh(m:Mesh): void {
        m.castShadow = true;
        m.receiveShadow = true;
        m.scale.multiplyScalar(this.scale);
        m.geometry.computeBoundingBox();
    }
}

