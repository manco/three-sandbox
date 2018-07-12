import {MeshSelector} from "./utils/mesh-selector.js";
import {Observable} from "./utils/observable.js";

export class ModuleSelector extends Observable {
    constructor(camera, kitchen, mouseTracker) {
        super();
        this.meshSelector = new MeshSelector(camera.threeJsCamera, mouseTracker);
        this.kitchen = kitchen;
        this.selected = null;
    }
    selectModule() {
        const allModules = this.kitchen.allModules();
        this.meshSelector.selectMesh(allModules.map(m => m.mesh));
        if (this.selected != null) {
            this.notify({ type: "DESELECTED", obj: this.selected });
        }
        this.selected = allModules.find(m => m.mesh === this.meshSelector.selected);
        if (this.selected != null) {
            this.notify({ type: "SELECTED", obj: this.selected });
        }
    }
}