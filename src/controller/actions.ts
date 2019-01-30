import {ModuleType} from "../model/modules/types";
import {ModuleSubtype} from "../model/modules/types";
import {ColorType} from "../model/colors";
import {Kitchen} from "../model/kitchen/kitchen";
import {ModuleSelector} from "../model/module-selector";
import {Coords} from "../utils/lang";
import {Camera} from "three";
import {Module} from "../model/modules/module";
import {ModuleFunction} from "../model/modules/module-functions";

export class Actions {
    constructor(
        private readonly kitchen: Kitchen,
        private readonly moduleSelector: ModuleSelector,
        private readonly camera: Camera
    ) {}

    loadKitchen(dims: {width:number, depth:number, height:number}, wallNames : string[]):void {
        this.kitchen.removeAll();
        this.kitchen.initFloorAndWalls(dims, wallNames);
    }

    changeColor(modules: ModuleType, toColor: ColorType): void {
        this.kitchen.modules.byType(modules)
            .forEach(m => this.kitchen.setColor(m, toColor));
    }

    selectModuleById(objId: string):void {
        this.moduleSelector.selectModule(this.kitchen.modules.byId(objId));
    }

    selectModule(coords: Coords) {
        const module = this.kitchen.byRaycast(this.camera, coords);
        this.moduleSelector.selectModule(module);
    }

    setModuleSubtype(module: Module, moduleSubtype: ModuleSubtype): void {
        this.kitchen.setModuleSubtype(module, moduleSubtype);
    }

    setModuleFunction(module:Module, moduleFunction: ModuleFunction): void {
        this.kitchen.setModuleFunction(module, moduleFunction);
        console.log(`setModuleFunction: ${module}, ${moduleFunction}`);
    }
}

