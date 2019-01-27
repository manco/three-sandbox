export class Actions {
    constructor(kitchen, moduleSelector, camera) {
        this.kitchen = kitchen;
        this.moduleSelector = moduleSelector;
        this.camera = camera;
    }
    loadKitchen(dims, wallNames) {
        this.kitchen.removeAll();
        this.kitchen.initFloorAndWalls(dims, wallNames);
    }
    changeColor(modules, toColor) {
        this.kitchen.modules.byType(modules)
            .forEach(m => this.kitchen.setBackTexture(m, toColor));
    }
    selectModuleById(objId) {
        this.moduleSelector.selectModule(this.kitchen.modules.byId(objId));
    }
    selectModule(coords) {
        const module = this.kitchen.byRaycast(this.camera, coords);
        this.moduleSelector.selectModule(module);
    }
    setModuleSubtype(module, moduleSubtype) {
        this.kitchen.setModuleSubtype(module, moduleSubtype);
    }
    setModuleFunction(module, moduleFunction) {
        this.kitchen.setModuleFunction(module, moduleFunction);
        console.log(`setModuleFunction: ${module}, ${moduleFunction}`);
    }
}
