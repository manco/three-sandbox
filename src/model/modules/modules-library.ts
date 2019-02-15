import {PromisingLoader} from "../../utils/loader";
import {Meshes} from "../../utils/meshes";
import {Mesh} from "three";
import {MeshLambertMaterial} from "three";
import {Module} from "./module";
import {ModuleDefinition} from "./module";
import {ModuleTypeToSubtype} from "./types";
import {ModuleType} from "./types";
import {ModuleSubtypeToModuleFunction} from "./module-functions";
import {ColorType} from "../colors";

export default class ModulesLibrary {
    private static readonly Scale: number = 3;
    private readonly loader = new PromisingLoader();
    private prototypes: Map<ModuleType, Mesh> = null;
    private _slotWidth: number = null;

    loadPrototypes(definitions: ModuleDefinition[]):void {
        if (this.prototypes === null) {
            Promise.all(
                definitions.map(
        (d:ModuleDefinition) =>
                    this.loader.loadSingleMesh(d.url)
                        .then((m:Mesh) => {
                            ModulesLibrary.initMesh(m, d.type);
                            return [d.type, m] as [ModuleType, Mesh]
                        })
                )
            )
            .then(meshes => {
                this.prototypes = new Map<ModuleType, Mesh>(meshes);

                //TODO ugly
                this._slotWidth = ModulesLibrary.Scale * Meshes.meshWidthX(this.ofType(ModuleType.STANDING));
            })
        } else {
            throw "sorry, prototypes already loaded or being loaded";
        }
    }

    createModule(type:ModuleType): Module {
        const mesh = this.ofType(type).clone();
        if (ModulesLibrary.hasFront(mesh)) {
            mesh.material = [new MeshLambertMaterial(), new MeshLambertMaterial()];
        } else {
            mesh.material = new MeshLambertMaterial();
        }
        const defaultSubtype = ModuleTypeToSubtype.get(type)[0];
        return new Module(
            mesh,
            type,
            defaultSubtype,
            ModuleSubtypeToModuleFunction.get(defaultSubtype)[0],
            ColorType.WHITE,
            ModulesLibrary.Scale * Meshes.meshWidthX(mesh),
            ModulesLibrary.Scale * Meshes.meshDepthY(mesh),
            (mm:Mesh):void => { mm.rotateX(-Math.PI / 2); }
        );
    }

    private ofType(type:ModuleType):Mesh {
        return this.prototypes.get(type);
    }

    private static initMesh(m:Mesh, type: ModuleType): void {
        if (type == ModuleType.STANDING) {
            m.castShadow = true;
        }
        m.receiveShadow = true;
        m.scale.multiplyScalar(ModulesLibrary.Scale);
        m.geometry.computeBoundingBox();
    }

    public slotWidth() {
        return this._slotWidth;
    }

    private static hasFront(mesh: Mesh) {
        return Array.isArray(mesh.material);
    }
}

