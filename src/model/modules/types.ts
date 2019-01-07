export enum ModuleType {
    STANDING, TABLETOP, HANGING
}

export enum ModuleSubtype {
    SHELVES, //hanging
    TABLETOP, SINK, OVEN_TABLETOP, //tabletop
    DRAWERS, FRIDGE, WASHER, OVEN //standing
}

export const ModuleTypeToSubtype: Map<ModuleType, ModuleSubtype[]> = new Map([
    [ModuleType.HANGING, [ModuleSubtype.SHELVES]],
    [ModuleType.TABLETOP, [ModuleSubtype.TABLETOP, ModuleSubtype.SINK, ModuleSubtype.OVEN_TABLETOP]],
    [ModuleType.STANDING, [ModuleSubtype.DRAWERS, ModuleSubtype.FRIDGE, ModuleSubtype.WASHER, ModuleSubtype.OVEN]]
]);

export const ModuleTypesAll = Array.from(ModuleTypeToSubtype.keys());