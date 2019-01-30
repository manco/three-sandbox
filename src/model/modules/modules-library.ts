import {PromisingLoader} from "../../utils/loader";
import {Meshes} from "../../utils/meshes";
import {Mesh} from "three";
import {Module} from "./module";
import {ModuleDefinition} from "./module";
import {ModuleTypeToSubtype} from "./types";
import {ModuleType} from "./types";
import {ModuleSubtypeToModuleFunction} from "./module-functions";

export default class ModulesLibrary {
    private readonly loader: PromisingLoader = new PromisingLoader();
    private readonly scale: number = 3;
    private prototypes: Map<ModuleType, Module> = null;

    //TODO prototypowac tylko meshe
    loadPrototypes(definitions: ModuleDefinition[]):void {
        if (this.prototypes === null) {
            Promise.all(
                definitions.map(
        (d:ModuleDefinition) =>
                    this.loader.loadSingleMesh(d.url)
                        .then((m:Mesh) => {
                            this.initMesh(m);
                            const defaultSubtype = ModuleTypeToSubtype.get(d.type)[0];
                            return new Module(
                                m,
                                d.type,
                                defaultSubtype,
                                ModuleSubtypeToModuleFunction.get(defaultSubtype)[0],
                                this.scale * Meshes.meshWidthX(m),
                                this.scale * Meshes.meshDepthY(m),
                                (mm:Mesh):void => { mm.rotateX(-Math.PI / 2); }
                            );
                        })
                )
            )
            .then(modules => new Map<ModuleType, Module>(modules.map(m => [m.type, m] as [ModuleType, Module])))
            .then(result => this.prototypes = result)
        } else {
            throw "sorry, prototypes already loaded or being loaded";
        }
    }

    createModule(type:ModuleType): Module {
        return this.ofType(type).clone();
    }

    ofType(type:ModuleType):Module {
        return this.prototypes.get(type);
    }

    private initMesh(m:Mesh): void {
        m.castShadow = true;
        m.receiveShadow = true;
        m.scale.multiplyScalar(this.scale);
        m.geometry.computeBoundingBox();
    }
}

