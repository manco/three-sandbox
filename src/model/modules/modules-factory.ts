import {Meshes} from "../../utils/meshes";
import {Module} from "./module";
import {ModuleTypeToSubtype} from "./types";
import {ModuleType} from "./types";
import {ModuleSubtype} from "./types";
import {ModuleSubtypeToModuleFunction} from "./module-functions";
import {ModuleFunction} from "./module-functions";
import {ColorType} from "../colors";
import {MeshFactory} from "../../utils/meshes-factory";

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

    createForType(type:ModuleType): Module {
        const defaultSubtype = ModuleTypeToSubtype.get(type)[0];
        const defaultFunction = ModuleSubtypeToModuleFunction.get(defaultSubtype)[0];
        return this.createForTypes(type, defaultSubtype, defaultFunction);
    }

    //types need to be consistent
    createForTypes(type:ModuleType, subtype: ModuleSubtype, fun:ModuleFunction, color: ColorType = ColorType.WHITE): Module {
        const mesh = this.meshFactory.create(ModuleFunctionToMesh.get(fun));
        const module = new Module(
            mesh,
            type,
            subtype,
            fun,
            color
        );
        module.initWireframe();
        return module;
    }

    public slotWidth() {
        return this._slotWidth;
    }
}

const ModuleFunctionToMesh = new Map([
    [ModuleFunction.SHELVES, 'hanging'],
    [ModuleFunction.CORNER_SHELVES, 'corner_hanging'],

    [ModuleFunction.TABLETOP, 'tabletop'],
    [ModuleFunction.CORNER_TABLETOP, 'corner_tabletop'],
    [ModuleFunction.OVEN_TABLETOP, 'tabletop'],
    [ModuleFunction.CHAMBER_1, 'tabletop'],
    [ModuleFunction.CHAMBER_DRAINER, 'tabletop'],
    [ModuleFunction.CHAMBER_2, 'tabletop'], //sink

    [ModuleFunction.NO_DRAWERS, 'standing'],
    [ModuleFunction.CORNER_NO_DRAWERS, 'corner_standing'],
    [ModuleFunction.BIG_2, 'standing_11'],
    [ModuleFunction.AVG_2_BIG_1, 'standing_21'],
    [ModuleFunction.AVG_4, 'standing_4'],
    [ModuleFunction.SMALL_2_AVG_1_BIG_1, 'standing_211'],
    [ModuleFunction.SMALL_2_AVG_3, 'standing_23'], //drawers
    [ModuleFunction.OVEN_1, 'standing'], //oven
    [ModuleFunction.UNDER_SINK, 'standing'], //under_sink
    [ModuleFunction.WASHER_1, 'standing'], //washer
    [ModuleFunction.DISHWASHER_1, 'standing'], //dishwasher,
    [ModuleFunction.FRIDGE_1 , 'standing']//fridge
]);

