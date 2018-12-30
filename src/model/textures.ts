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

export class TexturesLibrary {
    private readonly loader = new TextureLoader();
    private readonly textures: Map<TextureType, Texture> = new Map();

    loadTextures(definitions: TextureDefinition[]): void {
     definitions.map(
         d => this.textures.set(d.type, this.loader.load(d.url))
            );
    }

    get(type: TextureType): Texture | undefined {
        return this.textures.get(type);
    }
}