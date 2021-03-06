import {ModuleType} from "../model/modules/types";
import {ModuleSubtype} from "../model/modules/types";
import {BoundedSubtypes} from "../model/modules/types";
import {ColorType} from "../model/colors";
import {Kitchen} from "../model/kitchen/kitchen";
import {ModuleSelector} from "../model/module-selector";
import {Coords} from "../utils/lang";
import {Camera} from "three";
import {Module} from "../model/modules/module";
import {Meshes} from "../utils/meshes";
import {Stack} from "../model/stack";
import {FunctionsLarge} from "../model/modules/types";
import {Maps} from "../utils/lang";
import {Slot} from "../model/kitchen/kitchen";
import {ModuleFunction} from "../model/modules/types";
import {Arrays} from "../utils/lang";
import {Dimensions3D} from "../model/kitchen/kitchen";
import {Obstacle} from "../model/kitchen/obstacle";

export class Actions {
    constructor(
        private readonly kitchen: Kitchen,
        private readonly moduleSelector: ModuleSelector,
        private readonly camera: Camera,
        private readonly undoable: Stack<[Module, Slot]>,
        private removed: Array<[Slot, Module[]]> //multimap
    ) {}

    showWireframe() {
        this.kitchen.modules.all().forEach(m => Meshes.hideWireframe(m.mesh));
        this.kitchen.modules.byType(ModuleType.HANGING).forEach(m => Meshes.showWireframe(m.mesh, true));
        this.kitchen.modules.byType(ModuleType.TABLETOP).forEach(m => Meshes.showWireframe(m.mesh, false));
    }

    hideWireframe() {
        this.kitchen.modules.byType(ModuleType.HANGING).forEach(m => Meshes.hideWireframe(m.mesh));
        this.kitchen.modules.byType(ModuleType.TABLETOP).forEach(m => Meshes.hideWireframe(m.mesh));
        this.kitchen.modules.all().forEach(m => m.initWireframe());
    }

    loadKitchen(dims: Dimensions3D, wallNames : string[], obstacles: Obstacle[]):void {
        this.kitchen.removeAll();
        this.undoable.drop();
        this.removed = [];
        this.kitchen.initFloorAndWalls(dims, wallNames, obstacles);
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

    removeSelectedModule() {
        const toRemove = this.moduleSelector.getSelectedModule();
        if (toRemove !== null) {
            const slot = this.kitchen.revIndexes.slotFor(toRemove);
            this.undoable.push([toRemove, slot]);
            this.kitchen.remove(toRemove);
        }
    }

    undo() {
        const elem = this.undoable.pop();
        if (elem !== undefined) {
            const [m, slot] = elem;
            return this.kitchen.restoreModule(slot, m);
        }
    }

    setModuleSubtype(module: Module, newSubtype: ModuleSubtype): void {

        if (module.isCorner()) {
            throw "cant change subtype for corner module";
        }

        //propagate to bounded module first
        const boundedSubtype = BoundedSubtypes.get(newSubtype);
        if (boundedSubtype !== undefined) {
            const slot = this.kitchen.revIndexes.slotFor(module);
            const boundedModule = this.kitchen.modules.bySlot(slot)
                .get(
                    //FIXME this is lame. Types NEED tree structure OR reverse mapping
                    module.type === ModuleType.TABLETOP ? ModuleType.STANDING : ModuleType.TABLETOP
                );
            if (boundedModule !== undefined && boundedModule.subtype != boundedSubtype) {
                this.kitchen.setModuleSubtype(boundedModule, boundedSubtype);
            }
        }

        this.kitchen.setModuleSubtype(module, newSubtype);
    }

    setModuleFunction(module:Module, newFunction: ModuleFunction): void {

        if (FunctionsLarge.includes(newFunction)) {
            const slot = this.kitchen.revIndexes.slotFor(module);
            const toRemove = Maps.filterKeys(this.kitchen.modules.bySlot(slot), type => type !== module.type);
            this.removed.push([slot, Array.from(toRemove.values())]);
            toRemove.forEach(m => this.kitchen.remove(m));
        }

        if (FunctionsLarge.includes(module.moduleFunction)) {
            const slot = this.kitchen.revIndexes.slotFor(module);
            const modulesInSlot = this.removed.find(([s,]) => s === slot);
            Arrays.remove(this.removed, modulesInSlot);
            const [,modules] = modulesInSlot;
            modules.forEach(m => this.kitchen.restoreModule(slot, m));
        }

        this.kitchen.setModuleFunction(module, newFunction);
    }
}

