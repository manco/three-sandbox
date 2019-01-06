export enum ModuleType {
    STANDING, TABLETOP, HANGING
}

export enum ModuleTypeLvl2 {
    SHELVES, //hanging
    TABLETOP, SINK, OVEN_TABLETOP, //tabletop
    DRAWERS, FRIDGE, WASHER, OVEN //standing
}

export enum ModuleTypeLvl3 {
    BIG_2, AVG_2_BIG_1, AVG_4, SMALL_2_AVG_1_BIG_1, SMALL_2_AVG_3, //drawers
    CHAMBER_1, CHAMBER_DRAINER, CHAMBER_2, //sink
    OVEN_1, OVEN_2, OVEN_3, //oven
    WASHER_1, WASHER_2, WASHER_3, //washer
    FRIDGE_1, FRIDGE_2, FRIDGE_3 //fridge
}

export const ModuleTypeLvl1To2: Map<ModuleType, ModuleTypeLvl2[]> = new Map([
    [ModuleType.HANGING, [ModuleTypeLvl2.SHELVES]],
    [ModuleType.TABLETOP, [ModuleTypeLvl2.TABLETOP, ModuleTypeLvl2.SINK, ModuleTypeLvl2.OVEN_TABLETOP]],
    [ModuleType.STANDING, [ModuleTypeLvl2.DRAWERS, ModuleTypeLvl2.FRIDGE, ModuleTypeLvl2.WASHER, ModuleTypeLvl2.OVEN]]
]);

export const ModuleTypeLvl2To3: Map<ModuleTypeLvl2, ModuleTypeLvl3[]> = new Map([
    [ModuleTypeLvl2.SINK, [ModuleTypeLvl3.CHAMBER_1, ModuleTypeLvl3.CHAMBER_DRAINER, ModuleTypeLvl3.CHAMBER_2]],
    [ModuleTypeLvl2.DRAWERS, [ModuleTypeLvl3.BIG_2, ModuleTypeLvl3.AVG_2_BIG_1, ModuleTypeLvl3.AVG_4, ModuleTypeLvl3.SMALL_2_AVG_1_BIG_1, ModuleTypeLvl3.SMALL_2_AVG_3]],
    [ModuleTypeLvl2.OVEN,   [ModuleTypeLvl3.OVEN_1, ModuleTypeLvl3.OVEN_2, ModuleTypeLvl3.OVEN_3]],
    [ModuleTypeLvl2.WASHER, [ModuleTypeLvl3.WASHER_1, ModuleTypeLvl3.WASHER_2, ModuleTypeLvl3.WASHER_3]],
    [ModuleTypeLvl2.FRIDGE, [ModuleTypeLvl3.FRIDGE_1, ModuleTypeLvl3.FRIDGE_2, ModuleTypeLvl3.FRIDGE_3]]
]);

export const ModuleTypesAll = Array.from(ModuleTypeLvl1To2.keys());