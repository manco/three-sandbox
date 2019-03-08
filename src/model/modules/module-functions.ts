import {ModuleSubtype} from "./types";
import {TexturesLibrary} from "../../utils/textures";
import {TextureDefinition} from "../../utils/textures";
import {ColorType} from "../colors";
import {ColorTypeLibrary} from "../colors";
import {ColorTypeAll} from "../colors";
import {Texture} from "three";
import {CanvasTexture} from "three";

/*

[
    {
        'type':'standing',
        'subtypes':[
            {
                'subtype':'drawers',
                'functions': [
                    {
                        'fun':'1p1',
                        'mesh': 'models/szuflady_1+1.obj',
                        'icon': 'functions/szuflady_1p1.jpg'
                    }
                ]
            }
        ]
    }


 */
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

export class FrontsLibrary {

    //equivalent for Map<[ModuleFunction, ColorType], Texture>
    private readonly textures = new Map<ModuleFunction, Map<ColorType, Texture>>();

    constructor(colorsLibrary: ColorTypeLibrary) {
        const functionsLibrary = new ModuleFunctionLibrary();


        Promise.all(
            [colorsLibrary.loadingPromise(), functionsLibrary.loadingPromise()]
        ).then(() => {
            ModuleFunctionTexturesAll.forEach(fun => {
                const inner = new Map<ColorType, Texture>();
                ColorTypeAll.forEach( color => {
                    const texCanvas = document.createElementNS( 'http://www.w3.org/1999/xhtml', 'canvas' ) as HTMLCanvasElement;
                    const ctx = texCanvas.getContext("2d");
                    const blended =
                        FrontsLibrary.blendTextures(
                            colorsLibrary.get(color).image as HTMLImageElement,
                            functionsLibrary.get(fun).image as HTMLImageElement,
                            ctx);
                    inner.set(color, blended);
                });
                this.textures.set(fun, inner);
            });
        });


    }

    private static blendTextures(colorTex, functionTex, ctx): Texture {

        ctx.canvas.width = functionTex.width;
        ctx.canvas.height = functionTex.height;
        ctx.drawImage(colorTex, 0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.drawImage(functionTex, 0, 0, ctx.canvas.width, ctx.canvas.height);
        const texture = new CanvasTexture(ctx.canvas);
        texture.needsUpdate = true;
        return texture;
    }

    get(fun: ModuleFunction, color: ColorType): Texture | undefined {
        const keyPart = this.textures.get(fun);
        if (keyPart === undefined) {
            return undefined;
        }
        return keyPart.get(color);
    }
}

class ModuleFunctionLibrary extends TexturesLibrary<ModuleFunction> {
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

const ModuleFunctionTexturesAll = ModuleFunctionTextures.map(def => def.type);