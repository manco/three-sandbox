export enum ModuleType {
    STANDING, TABLETOP, HANGING
}

export enum ModuleSubtype {
    SHELVES, DRAWERS, TABLETOP, SINK, OVEN, OVEN_TABLETOP, WASHER, FRIDGE
}

export const ModuleSubtypesOfTypes: Map<ModuleType, ModuleSubtype[]> = new Map([
    [ModuleType.STANDING, [ModuleSubtype.DRAWERS, ModuleSubtype.FRIDGE, ModuleSubtype.WASHER, ModuleSubtype.OVEN]],
    [ModuleType.TABLETOP, [ModuleSubtype.TABLETOP, ModuleSubtype.SINK, ModuleSubtype.OVEN_TABLETOP]],
    [ModuleType.HANGING, [ModuleSubtype.SHELVES]]
]);
export const ModuleTypesAll = Array.from(ModuleSubtypesOfTypes.keys());