import {TexturesLibrary} from "../utils/textures";
import {TextureDefinition} from "../utils/textures";

export enum ColorType {
    WHITE, GRAYLIGHT, GRAY, WOOD
}

export const ColorTypeUrls = [
    new TextureDefinition(ColorType.WHITE, 'textures/white.jpg'),
    new TextureDefinition(ColorType.GRAYLIGHT, 'textures/gray-light.jpg'),
    new TextureDefinition(ColorType.GRAY, 'textures/gray.jpg'),
    new TextureDefinition(ColorType.WOOD, 'textures/wood.jpg'),
];

export class ColorTypeLibrary extends TexturesLibrary<ColorType> {
    constructor() {
        super();
        super.loadTextures(ColorTypeUrls);
    }
}