import {Meshes} from "../../utils/meshes";
import {Module} from "./module";
import {ModuleTypeToSubtype} from "./types";
import {ModuleType} from "./types";
import {ModuleSubtypeToModuleFunction} from "./module-functions";
import {ColorType} from "../colors";
import {MeshFactory} from "../../utils/meshes-factory";

export default class ModulesFactory {
    private _slotWidth: number;

    constructor(private readonly meshFactory: MeshFactory, defaultSlotWidth?: number) {
        this._slotWidth = defaultSlotWidth;
        const loading: Promise<void> = this.meshFactory.loadPrototypes();
        loading.then(
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
            ColorType.WHITE
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

