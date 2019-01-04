import {ModuleType} from "./model/modules/types";
import {TextureType} from "./model/textures";
import {Kitchen} from "./model/kitchen/kitchen";
import {ModuleSelector} from "./model/module-selector";
import {Coords} from "./utils/lang";
import {Camera} from "./view/camera";

export class Actions {
    constructor(
        private readonly kitchen: Kitchen,
        private readonly moduleSelector: ModuleSelector,
        private readonly camera: Camera
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

    selectModuleById(objId: string):void {
        this.moduleSelector.selectModuleById(objId);
    }

    selectModule(coords: Coords) {
        this.moduleSelector.selectModule(coords, this.camera);
    }
}

