import {Meshes} from "../../utils/meshes";
import {Module} from "./module";
import {ModuleTypeToSubtype} from "./types";
import {ModuleType} from "./types";
import {ModuleSubtypeToModuleFunction} from "./module-functions";
import {ColorType} from "../colors";
import {Mesh} from "three";

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
        const mesh = this.meshFactory.create(ModuleTypeToMesh.get(type));
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


}

const ModuleTypeToMesh = new Map([
    [ModuleType.STANDING, 'standing'],
    [ModuleType.TABLETOP, 'tabletop'],
    [ModuleType.HANGING, 'hanging']
]);

