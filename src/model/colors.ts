import {TexturesLibrary} from "../utils/textures";
import {TextureDefinition} from "../utils/textures";

export enum ColorType {
    BLACK, GRAY, WHITE, WOOD
}

export const ColorTypeUrls = [
    new TextureDefinition(ColorType.BLACK, 'textures/black.jpg'),
    new TextureDefinition(ColorType.GRAY, 'textures/gray.jpg'),
    new TextureDefinition(ColorType.WOOD, 'textures/wood.jpg'),
    new TextureDefinition(ColorType.WHITE, 'textures/gray-light.jpg')
];

export class ColorTypeLibrary extends TexturesLibrary<ColorType> {
    constructor() {
        super();
        super.loadTextures(ColorTypeUrls);
    }
}