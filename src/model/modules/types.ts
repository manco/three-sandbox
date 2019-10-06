export enum ModuleType {
    STANDING, TABLETOP, HANGING
}

export enum ModuleSubtype {
    SHELVES, //hanging
    SINK, TABLETOP, OVEN_TABLETOP, //tabletop
    UNDER_SINK, DRAWERS, FRIDGE, WASHER, DISHWASHER, OVEN //standing
}

export const ModuleTypeToSubtype: Map<ModuleType, ModuleSubtype[]> = new Map([
    [ModuleType.HANGING, [ModuleSubtype.SHELVES]],
    [ModuleType.TABLETOP, [ModuleSubtype.TABLETOP, ModuleSubtype.SINK, ModuleSubtype.OVEN_TABLETOP]],
    [ModuleType.STANDING, [ModuleSubtype.DRAWERS, ModuleSubtype.UNDER_SINK, ModuleSubtype.FRIDGE, ModuleSubtype.WASHER, ModuleSubtype.DISHWASHER, ModuleSubtype.OVEN]]
]);

export const BoundedSubtypes:Map<ModuleSubtype, ModuleSubtype> = new Map([
    [ ModuleSubtype.SINK, ModuleSubtype.UNDER_SINK ],
    [ ModuleSubtype.UNDER_SINK, ModuleSubtype.SINK ]
]
);

export const SubtypesLarge = [ModuleSubtype.FRIDGE];

export const ModuleTypesAll = Array.from(ModuleTypeToSubtype.keys());