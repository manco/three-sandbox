import {Meshes} from "../../utils/meshes";
import {Module} from "./module";
import {ModuleTypeToSubtype} from "./types";
import {ModuleType} from "./types";
import {ModuleSubtype} from "./types";
import {ColorType} from "../colors";
import {MeshFactory} from "../../utils/meshes-factory";
import {ModuleSubtypeToModuleFunction} from "./types";
import {ModuleFunction} from "./types";
import {ResizeStrategy} from "./resizing";
import {ResizeStrategyFactory} from "./resizing";
import {ModuleTypeCorners} from "./types";

export default class ModulesFactory {
    private _slotWidth: number;
    private _cornerWidth: number;

    constructor(private readonly meshFactory: MeshFactory, defaultSlotWidth?: number, defaultCornerWidth?: number) {
        this._slotWidth = defaultSlotWidth;
        this._cornerWidth = defaultCornerWidth;
        const loading: Promise<void> = this.meshFactory.loadPrototypes();
        loading.then(
            () => {
                this._slotWidth = Meshes.meshWidthX(this.meshFactory.ofType('standing'));
                this._cornerWidth = Meshes.meshWidthX(this.meshFactory.ofType('corner_standing'));
            }
        )
    }

    createForType(type:ModuleType, resize: ResizeStrategy = ResizeStrategyFactory.NOOP): Module {
        const defaultSubtype = ModuleTypeToSubtype.get(type)[0];
        const defaultFunction = ModuleSubtypeToModuleFunction.get(defaultSubtype)[0];
        return this.createForTypes(type, defaultSubtype, defaultFunction, resize);
    }

    //types need to be consistent
    createForTypes(type:ModuleType, subtype: ModuleSubtype, fun:ModuleFunction, resize: ResizeStrategy = ResizeStrategyFactory.NOOP, color: ColorType = ColorType.WHITE): Module {
        const mesh = this.meshFactory.create(ModuleFunctionToMesh.get(fun));
        const module = new Module(
            mesh,
            type,
            subtype,
            fun,
            color,
            resize
        );
        module.initWireframe();
        return module;
    }

    createCorner(type:ModuleType) {
        return this.createForTypes(
            type,
            ModuleTypeToSubtype.get(type)[0],
            ModuleTypeCorners.get(type)
        )
    }

    public slotWidth() {
        if (this._slotWidth === undefined)
            throw new Error("modulesFactory not ready!");
        return this._slotWidth;
    }

    public cornerWidth() {
        if (this._cornerWidth === undefined)
            throw new Error("modulesFactory not ready!");
        return this._cornerWidth;
    }
}

const ModuleFunctionToMesh = new Map([
    [ModuleFunction.SHELVES, 'hanging'],
    [ModuleFunction.CORNER_SHELVES, 'corner_hanging'],

    [ModuleFunction.TABLETOP, 'tabletop'],
    [ModuleFunction.CORNER_TABLETOP, 'corner_tabletop'],
    [ModuleFunction.OVEN_TABLETOP, 'tabletop'],
    [ModuleFunction.CHAMBER_1, 'tabletop_sink_chamber_1'],
    [ModuleFunction.CHAMBER_DRAINER, 'tabletop_sink_chamber_drainer'],
    [ModuleFunction.CHAMBER_2, 'tabletop_sink_chamber_2'], //sink

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
    [ModuleFunction.FRIDGE_1, 'standing'],
    [ModuleFunction.FRIDGE_2, 'fridge']//fridge
]);

