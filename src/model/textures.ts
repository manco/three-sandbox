import {TextureLoader} from "three";
import {Texture} from "three";

export class TextureDefinition {
    constructor(
        readonly url: string,
        readonly type: TextureType
    ) {
    }
}

export enum TextureType {
    BLACK, GRAY, WHITE, WOOD
}
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