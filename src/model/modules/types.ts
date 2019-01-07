export enum ModuleType {
    STANDING, TABLETOP, HANGING
}

export enum ModuleTypeLvl2 {
    SHELVES, //hanging
    TABLETOP, SINK, OVEN_TABLETOP, //tabletop
    DRAWERS, FRIDGE, WASHER, OVEN //standing
}

export const ModuleTypeLvl1To2: Map<ModuleType, ModuleTypeLvl2[]> = new Map([
    [ModuleType.HANGING, [ModuleTypeLvl2.SHELVES]],
    [ModuleType.TABLETOP, [ModuleTypeLvl2.TABLETOP, ModuleTypeLvl2.SINK, ModuleTypeLvl2.OVEN_TABLETOP]],
    [ModuleType.STANDING, [ModuleTypeLvl2.DRAWERS, ModuleTypeLvl2.FRIDGE, ModuleTypeLvl2.WASHER, ModuleTypeLvl2.OVEN]]
]);

export const ModuleTypesAll = Array.from(ModuleTypeLvl1To2.keys());