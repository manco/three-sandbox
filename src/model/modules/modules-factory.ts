import {Meshes} from "../../utils/meshes";
import {Mesh} from "three";
import {MeshLambertMaterial} from "three";
import {Module} from "./module";
import {ModuleTypeToSubtype} from "./types";
import {ModuleType} from "./types";
import {ModuleSubtypeToModuleFunction} from "./module-functions";
import {ColorType} from "../colors";

export default class ModulesFactory {
    private _slotWidth: number = null;

    constructor(private readonly meshFactory) {
        this.meshFactory.loadPrototypes().then(
            _ => {
                this._slotWidth = Meshes.meshWidthX(this.meshFactory.ofType('standing'));
            }
        )
    }

    createModule(type:ModuleType): Module {
        const mesh = this.meshFactory.ofType(ModuleTypeToMesh.get(type)).clone();
        if (ModulesFactory.hasFront(mesh)) {
            mesh.material = [new MeshLambertMaterial(), new MeshLambertMaterial()]; //TODO make it foo(mesh.material)
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
            this._slotWidth,
            Meshes.meshDepthY(mesh),
            (mm:Mesh):void => { mm.rotateX(-Math.PI / 2); }
        );
    }

    public slotWidth() {
        return this._slotWidth;
    }

    private static hasFront(mesh: Mesh) {
        return Array.isArray(mesh.material);
    }
}

const ModuleTypeToMesh = new Map([
    [ModuleType.STANDING, 'standing'],
    [ModuleType.TABLETOP, 'tabletop'],
    [ModuleType.HANGING, 'hanging']
]);

