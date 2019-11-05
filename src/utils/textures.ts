import {TextureLoader} from "three";
import {Texture} from "three";
import {RepeatWrapping} from "three";
import {LinearMipMapLinearFilter} from "three";
import {NearestFilter} from "three";

export class TextureDefinition<T> {
    constructor(
        readonly type: T,
        readonly url: string
    ) {}
}

export abstract class TexturesLibrary<T> {

    private readonly loader = new TextureLoader();
    private readonly textures: Map<T, Texture> = new Map();
    private loading = null;

    protected loadTextures(definitions: TextureDefinition<T>[]): void {
        this.loading = Promise.all(
            definitions.map(
            d =>
                new Promise<Texture>(f => this.loader.load(d.url, f))
                    .then(t => {
                        t.name = d.type.toString();
                        return TexturesLibrary.withOptions(t);
                    })
                    .then(tex => this.textures.set(d.type, tex))
            )
        );
    }


    private static withOptions(t: Texture): Texture {
        t.wrapS = RepeatWrapping;
        t.wrapT = RepeatWrapping;
        return t;
    }

    loadingPromise() {
        return this.loading;
    }

    get(type: T): Texture | undefined {
        return this.textures.get(type);
    }
}