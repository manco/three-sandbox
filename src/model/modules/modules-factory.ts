import {Meshes} from "../../utils/meshes";
import {Module} from "./module";
import {ModuleTypeToSubtype} from "./types";
import {ModuleType} from "./types";
import {ModuleSubtypeToModuleFunction} from "./module-functions";
import {ColorType} from "../colors";
import {MeshFactory} from "../../utils/meshes-factory";
import {ModuleFunction} from "./module-functions";

export default class ModulesFactory {
    private _slotWidth: number;

    constructor(private readonly meshFactory: MeshFactory, defaultSlotWidth?: number) {
        this._slotWidth = defaultSlotWidth;
        const loading: Promise<void> = this.meshFactory.loadPrototypes();
        loading.then(
            () => {
                this._slotWidth = Meshes.meshWidthX(this.meshFactory.ofType('standing'));
            }
        )
    }

    createModule(type:ModuleType): Module {
        const defaultSubtype = ModuleTypeToSubtype.get(type)[0];
        const defaultFunction = ModuleSubtypeToModuleFunction.get(defaultSubtype)[0];
        const mesh = this.meshFactory.create(ModuleFunctionToMesh.get(defaultFunction));
        return new Module(
            mesh,
            type,
            defaultSubtype,
            defaultFunction,
            ColorType.WHITE
        );
    }

    public slotWidth() {
        return this._slotWidth;
    }
}

const ModuleFunctionToMesh = new Map([
    [ModuleFunction.SHELVES, 'hanging'],

    [ModuleFunction.TABLETOP, 'tabletop'],
    [ModuleFunction.CHAMBER_1, 'tabletop'],
    [ModuleFunction.CHAMBER_DRAINER, 'tabletop'],
    [ModuleFunction.CHAMBER_2, 'tabletop'], //sink

    [ModuleFunction.NO_DRAWERS, 'standing'],
    [ModuleFunction.BIG_2, 'standing_11'],
    [ModuleFunction.AVG_2_BIG_1, 'standing_21'],
    [ModuleFunction.AVG_4, 'standing_4'],
    [ModuleFunction.SMALL_2_AVG_1_BIG_1, 'standing_211'],
    [ModuleFunction.SMALL_2_AVG_3, 'standing_23'], //drawers
    [ModuleFunction.OVEN_1, 'standing'], //oven
    [ModuleFunction.WASHER_1, 'standing'], //washer
    [ModuleFunction.FRIDGE_1 , 'standing']//fridge
]);

