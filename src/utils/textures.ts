import {TextureLoader} from "three";
import {Texture} from "three";

export class TextureDefinition<T> {
    constructor(
        readonly type: T,
        readonly url: string
    ) {}
}

export abstract class TexturesLibrary<T> {

    private readonly loader = new TextureLoader();
    private readonly textures: Map<T, Texture> = new Map();

    protected loadTextures(definitions: TextureDefinition<T>[]): void {
        definitions.map(
            d => this.textures.set(d.type, this.loadTexture(d))
        );
    }

    private loadTexture(d:TextureDefinition<T>):Texture {
        const tex = this.loader.load(d.url);
        tex.name = d.type.toString();
        return tex;
    }

    get(type: T): Texture | undefined {
        return this.textures.get(type);
    }
}