//TODO extract actions from main.ts

import {ModuleType} from "./model/modules/types";
import {TextureType} from "./model/textures";
import {Kitchen} from "./model/kitchen/kitchen";

export class Actions {
    constructor(
        private readonly kitchen: Kitchen
    ) {}

    loadKitchen() {
        //TODO move from main.ts
    }

    changeColor(modules: ModuleType, toColor: TextureType): void {
        this.kitchen.allModules()
            .filter(m => m.type === modules)
            .forEach(m => this.kitchen.setTexture(m, toColor));
    }
}

