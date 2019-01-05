import {TextureLoader} from "three";
import {Texture} from "three";

export enum TextureType {
    BLACK, GRAY, WHITE, WOOD
}

export class TextureDefinition {
    constructor(
        readonly url: string,
        readonly type: TextureType
    ) {
    }
}

export const TexturesUrls = new Map<TextureType, string>([
    [ TextureType.BLACK , 'textures/black.jpg'],
    [ TextureType.GRAY , 'textures/gray.jpg'],
    [ TextureType.WOOD , 'textures/wood.jpg'],
    [ TextureType.WHITE, 'textures/gray-light.jpg']
]);


export const TextureTypesAll = [TextureType.BLACK, TextureType.GRAY, TextureType.WHITE, TextureType.WOOD];

export class TexturesLibrary {
    private readonly loader = new TextureLoader();
    private readonly textures: Map<TextureType, Texture> = new Map();

    loadTextures(definitions: TextureDefinition[]): void {
     definitions.map(
         d => this.textures.set(d.type, this.loadTexture(d))
            );
    }

    private loadTexture(d:TextureDefinition):Texture {
        const tex = this.loader.load(d.url);
        tex.name = d.type.toString();
        return tex;
    }

    get(type: TextureType): Texture | undefined {
        return this.textures.get(type);
    }
}