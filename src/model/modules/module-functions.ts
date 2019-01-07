import {ModuleTypeLvl2} from "./types";

export enum ModuleFunction {
    BIG_2, AVG_2_BIG_1, AVG_4, SMALL_2_AVG_1_BIG_1, SMALL_2_AVG_3, //drawers
    CHAMBER_1, CHAMBER_DRAINER, CHAMBER_2, //sink
    OVEN_1, //oven
    WASHER_1, //washer
    FRIDGE_1 //fridge
}

export const ModuleTypeLvl2ToModuleFunction: Map<ModuleTypeLvl2, ModuleFunction[]> = new Map([
    [ModuleTypeLvl2.SINK, [ModuleFunction.CHAMBER_1, ModuleFunction.CHAMBER_DRAINER, ModuleFunction.CHAMBER_2]],
    [ModuleTypeLvl2.DRAWERS, [ModuleFunction.BIG_2, ModuleFunction.AVG_2_BIG_1, ModuleFunction.AVG_4, ModuleFunction.SMALL_2_AVG_1_BIG_1, ModuleFunction.SMALL_2_AVG_3]],
    [ModuleTypeLvl2.OVEN,   [ModuleFunction.OVEN_1]],
    [ModuleTypeLvl2.WASHER, [ModuleFunction.WASHER_1]],
    [ModuleTypeLvl2.FRIDGE, [ModuleFunction.FRIDGE_1]]
]);

export const ModuleFunctionsUrls = new Map<ModuleFunction, string>([
    [ ModuleFunction.FRIDGE_1, 'textures/lodowka.jpg'],
    [ ModuleFunction.OVEN_1, 'textures/piekarnik.jpg'],
    [ ModuleFunction.WASHER_1, 'textures/pralka.jpg'],
    [ ModuleFunction.BIG_2, 'textures/szuflady_1p1.jpg'],
    [ ModuleFunction.AVG_2_BIG_1, 'textures/szuflady_2p1.jpg'],
    [ ModuleFunction.SMALL_2_AVG_1_BIG_1, 'textures/szuflady_2p1p1.jpg'],
    [ ModuleFunction.SMALL_2_AVG_3, 'textures/szuflady_2p3.jpg'],
    [ ModuleFunction.AVG_4, 'textures/szuflady_4.jpg'],
    [ ModuleFunction.CHAMBER_1, 'textures/zlew.jpg'],
    [ ModuleFunction.CHAMBER_DRAINER, 'textures/zlew.jpg'],
    [ ModuleFunction.CHAMBER_2, 'textures/zlew.jpg']
]);