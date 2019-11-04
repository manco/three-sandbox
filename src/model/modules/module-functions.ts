import {TexturesLibrary} from "../../utils/textures";
import {ColorType} from "../colors";
import {ColorTypeLibrary} from "../colors";
import {ColorTypeAll} from "../colors";
import {Texture} from "three";
import {CanvasTexture} from "three";
import {ModuleFunction} from "./types";
import {ModuleFunctionTextures} from "./types";
import {ModuleFunctionTexturesAll} from "./types";

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
                    const ctx = (document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas') as HTMLCanvasElement).getContext("2d");
                    const colorTexture = colorsLibrary.get(color);
                    const functionTexture = functionsLibrary.get(fun);
                    const blended =
                        FrontsLibrary.blendTextures(
                            colorTexture.image as HTMLImageElement,
                            functionTexture.image as HTMLImageElement,
                            ctx);
                    blended.name = colorTexture.name + functionTexture.name;
                    inner.set(color, blended);
                });
                this.textures.set(fun, inner);
            });
        });
    }

    private static blendTextures(colorTex: HTMLImageElement, functionTex: HTMLImageElement, ctx: CanvasRenderingContext2D): Texture {

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