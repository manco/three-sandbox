import {MeshSelector} from "./utils/mesh-selector.js";

export class ModuleSelector {
    constructor(camera, kitchen, mouseTracker) {
        this.meshSelector = new MeshSelector(camera.threeJsCamera, mouseTracker);
        this.kitchen = kitchen;
        this.selected = null;
    }
    selectModule() {
        const allModules = this.kitchen.allModules();
        this.meshSelector.selectMesh(allModules.map(m => m.mesh));
        this.selected = allModules.find(m => m.mesh === this.meshSelector.selected);
    }
}