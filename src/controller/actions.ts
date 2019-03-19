import {ModuleType} from "../model/modules/types";
import {ModuleSubtype} from "../model/modules/types";
import {ColorType} from "../model/colors";
import {Kitchen} from "../model/kitchen/kitchen";
import {ModuleSelector} from "../model/module-selector";
import {Coords} from "../utils/lang";
import {Camera} from "three";
import {Module} from "../model/modules/module";
import {ModuleFunction} from "../model/modules/module-functions";
import {BoundedSubtypes} from "../model/modules/types";

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

    setModuleSubtype(module: Module, newSubtype: ModuleSubtype): void {
        //propagate to bounded module first
        const boundedSubtype = BoundedSubtypes.get(newSubtype);
        if (boundedSubtype !== undefined) {
            const slot = this.kitchen.revIndexes.slotFor(module);
            const boundedModule = this.kitchen.modules.bySlot(slot)
                .get(
                    //FIXME this is lame. Types NEED tree structure MUST HAVE
                    module.type === ModuleType.TABLETOP ? ModuleType.STANDING : ModuleType.TABLETOP
                );
            if (boundedModule !== undefined && boundedModule.subtype != boundedSubtype) {
                this.kitchen.setModuleSubtype(boundedModule, boundedSubtype);
            }
        }
        this.kitchen.setModuleSubtype(module, newSubtype);
    }

    setModuleFunction(module:Module, moduleFunction: ModuleFunction): void {
        this.kitchen.setModuleFunction(module, moduleFunction);
    }
}

