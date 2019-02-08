import {ModuleSubtype} from "./types";
import {TexturesLibrary} from "../../utils/textures";
import {TextureDefinition} from "../../utils/textures";

export enum ModuleFunction {
    BIG_2, AVG_2_BIG_1, AVG_4, SMALL_2_AVG_1_BIG_1, SMALL_2_AVG_3, //drawers
    CHAMBER_1, CHAMBER_DRAINER, CHAMBER_2, //sink
    OVEN_1, //oven
    WASHER_1, //washer
    FRIDGE_1 //fridge
}

export const ModuleSubtypeToModuleFunction: Map<ModuleSubtype, ModuleFunction[]> = new Map([
    [ModuleSubtype.SINK, [ModuleFunction.CHAMBER_1, ModuleFunction.CHAMBER_DRAINER, ModuleFunction.CHAMBER_2]],
    [ModuleSubtype.DRAWERS, [ModuleFunction.BIG_2, ModuleFunction.AVG_2_BIG_1, ModuleFunction.AVG_4, ModuleFunction.SMALL_2_AVG_1_BIG_1, ModuleFunction.SMALL_2_AVG_3]],
    [ModuleSubtype.OVEN,   [ModuleFunction.OVEN_1]],
    [ModuleSubtype.WASHER, [ModuleFunction.WASHER_1]],
    [ModuleSubtype.FRIDGE, [ModuleFunction.FRIDGE_1]],
    [ModuleSubtype.SHELVES, []],
    [ModuleSubtype.TABLETOP, []],
    [ModuleSubtype.OVEN_TABLETOP, []]
]);

export const ModuleFunctionsIcons = new Map<ModuleFunction, string>([
    [ ModuleFunction.FRIDGE_1, 'functions/lodowka.png'],
    [ ModuleFunction.OVEN_1, 'functions/piekarnik.png'],
    [ ModuleFunction.WASHER_1, 'functions/pralka.png'],
    [ ModuleFunction.BIG_2, 'functions/szuflady_1p1.jpg'],
    [ ModuleFunction.AVG_2_BIG_1, 'functions/szuflady_2p1.jpg'],
    [ ModuleFunction.SMALL_2_AVG_1_BIG_1, 'functions/szuflady_2p1p1.jpg'],
    [ ModuleFunction.SMALL_2_AVG_3, 'functions/szuflady_2p3.jpg'],
    [ ModuleFunction.AVG_4, 'functions/szuflady_4.jpg'],
    [ ModuleFunction.CHAMBER_1, 'functions/zlewozmywak.png'],
    [ ModuleFunction.CHAMBER_DRAINER, 'functions/zlewozmywak.png'],
    [ ModuleFunction.CHAMBER_2, 'functions/zlewozmywak.png']
]);

export class FrontsLibrary extends TexturesLibrary<ModuleFunction> {
    constructor() {
        super();
        super.loadTextures(ModuleFunctionTextures);
    }
}

const ModuleFunctionTextures = [
    new TextureDefinition(ModuleFunction.FRIDGE_1, 'functions/lodowka.png'),
    new TextureDefinition(ModuleFunction.OVEN_1, 'functions/piekarnik.png'),
    new TextureDefinition(ModuleFunction.WASHER_1, 'functions/pralka.png'),
    new TextureDefinition(ModuleFunction.CHAMBER_1, 'functions/zlewozmywak.png'),
    new TextureDefinition(ModuleFunction.CHAMBER_DRAINER, 'functions/zlewozmywak.png'),
    new TextureDefinition(ModuleFunction.CHAMBER_2, 'functions/zlewozmywak.png')
];