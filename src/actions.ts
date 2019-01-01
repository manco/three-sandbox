import {ModuleType} from "./model/modules/types";
import {TextureType} from "./model/textures";
import {Kitchen} from "./model/kitchen/kitchen";

export class Actions {
    constructor(
        private readonly kitchen: Kitchen
    ) {}

    loadKitchen([ width, depth, height ]: [number, number, number], wallNames : string[]):void {
        this.kitchen.removeAll();
        this.kitchen.initFloorAndWalls(width, height, depth, wallNames);
    }

    changeColor(modules: ModuleType, toColor: TextureType): void {
        this.kitchen.allModules()
            .filter(m => m.type === modules)
            .forEach(m => this.kitchen.setTexture(m, toColor));
    }
}

