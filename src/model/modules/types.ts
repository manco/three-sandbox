import {TextureDefinition} from "../../utils/textures";

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

export enum ModuleFunction {
    SHELVES,
    CORNER_SHELVES,

    TABLETOP,
    CORNER_TABLETOP,
    OVEN_TABLETOP,
    CHAMBER_1,
    CHAMBER_DRAINER,
    CHAMBER_2,

    NO_DRAWERS,
    CORNER_NO_DRAWERS,
    BIG_2,
    AVG_2_BIG_1,
    AVG_4,
    SMALL_2_AVG_1_BIG_1,
    SMALL_2_AVG_3,
    OVEN_1,
    UNDER_SINK,
    WASHER_1,
    DISHWASHER_1,
    FRIDGE_1,
    FRIDGE_2
}

export const ModuleTypeCorners: Map<ModuleType, ModuleFunction> = new Map([
    [ModuleType.HANGING, ModuleFunction.CORNER_SHELVES],
    [ModuleType.TABLETOP, ModuleFunction.CORNER_TABLETOP],
    [ModuleType.STANDING, ModuleFunction.CORNER_NO_DRAWERS]
]);

export const ModuleSubtypeToModuleFunction: Map<ModuleSubtype, ModuleFunction[]> = new Map([
    [ModuleSubtype.UNDER_SINK, [ModuleFunction.UNDER_SINK]],
    [ModuleSubtype.SINK, [ModuleFunction.CHAMBER_1, ModuleFunction.CHAMBER_DRAINER, ModuleFunction.CHAMBER_2]],
    [ModuleSubtype.DRAWERS, [ModuleFunction.NO_DRAWERS, ModuleFunction.BIG_2, ModuleFunction.AVG_2_BIG_1, ModuleFunction.AVG_4, ModuleFunction.SMALL_2_AVG_1_BIG_1, ModuleFunction.SMALL_2_AVG_3, ModuleFunction.CORNER_NO_DRAWERS]],
    [ModuleSubtype.OVEN,   [ModuleFunction.OVEN_1]],
    [ModuleSubtype.WASHER, [ModuleFunction.WASHER_1]],
    [ModuleSubtype.DISHWASHER, [ModuleFunction.DISHWASHER_1]],
    [ModuleSubtype.FRIDGE, [ModuleFunction.FRIDGE_1, ModuleFunction.FRIDGE_2]],
    [ModuleSubtype.SHELVES, [ModuleFunction.SHELVES, ModuleFunction.CORNER_SHELVES]],
    [ModuleSubtype.TABLETOP, [ModuleFunction.TABLETOP, ModuleFunction.CORNER_TABLETOP]],
    [ModuleSubtype.OVEN_TABLETOP, [ModuleFunction.OVEN_TABLETOP]]
]);

export const ModuleFunctionsIcons = new Map<ModuleFunction, string>([
    [ ModuleFunction.SHELVES, 'functions/szafka_gora.jpg'],
    [ ModuleFunction.FRIDGE_1, 'functions/lodowka.png'],
    [ ModuleFunction.FRIDGE_2, 'functions/lodowka.png'],
    [ ModuleFunction.OVEN_1, 'functions/piekarnik.png'],
    [ ModuleFunction.WASHER_1, 'functions/pralka.png'],
    [ ModuleFunction.DISHWASHER_1, 'functions/zmywarka.png'],
    [ ModuleFunction.NO_DRAWERS, 'functions/szafka_dol.jpg'],
    [ ModuleFunction.BIG_2, 'functions/szuflady_1p1.jpg'],
    [ ModuleFunction.AVG_2_BIG_1, 'functions/szuflady_2p1.jpg'],
    [ ModuleFunction.SMALL_2_AVG_1_BIG_1, 'functions/szuflady_2p1p1.jpg'],
    [ ModuleFunction.SMALL_2_AVG_3, 'functions/szuflady_2p3.jpg'],
    [ ModuleFunction.AVG_4, 'functions/szuflady_4.jpg'],
    [ ModuleFunction.UNDER_SINK, 'functions/zlewozmywak.png'],
    [ ModuleFunction.CHAMBER_1, 'functions/zlewozmywak_jednokomorowy.jpg'],
    [ ModuleFunction.CHAMBER_DRAINER, 'functions/zlewozmywak_ociekacz.jpg'],
    [ ModuleFunction.CHAMBER_2, 'functions/zlewozmywak_dwukomorowy.jpg'],
    [ ModuleFunction.OVEN_TABLETOP, 'functions/plyta.jpg']
]);

export const FunctionsLarge = [ModuleFunction.FRIDGE_2];

export const ModuleTypesAll = Array.from(ModuleTypeToSubtype.keys());

export const ModuleFunctionTextures = [
    new TextureDefinition(ModuleFunction.FRIDGE_1, 'functions/lodowka.png'),
    new TextureDefinition(ModuleFunction.FRIDGE_2, 'functions/lodowka.png'),
    new TextureDefinition(ModuleFunction.OVEN_1, 'functions/piekarnik.png'),
    new TextureDefinition(ModuleFunction.WASHER_1, 'functions/pralka.png'),
    new TextureDefinition(ModuleFunction.DISHWASHER_1, 'functions/zmywarka.png'),
    new TextureDefinition(ModuleFunction.UNDER_SINK, 'functions/zlewozmywak.png'),
    new TextureDefinition(ModuleFunction.CHAMBER_1, 'functions/zlewozmywak_white.jpg'),
    new TextureDefinition(ModuleFunction.CHAMBER_DRAINER, 'functions/zlewozmywak_white.jpg'),
    new TextureDefinition(ModuleFunction.CHAMBER_2, 'functions/zlewozmywak_white.jpg'),
    new TextureDefinition(ModuleFunction.OVEN_TABLETOP, 'functions/plyta.jpg')
];

export const ModuleFunctionTexturesAll = ModuleFunctionTextures.map(def => def.type);