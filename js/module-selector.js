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
        this._selectModule((meshes) => this.meshSelector.selectMeshByRaycast(meshes));
    }
    selectModuleById(id) {
        this._selectModule((meshes) => this.meshSelector.selectMeshById(id, meshes));
    }
    _selectModule(selectMeshFun) {
        const allModules = this.kitchen.allModules();
        if (this.selected != null) {
            this.notify({ type: "DESELECTED", obj: this.selected });
        }
        const meshSelected = selectMeshFun(allModules.map(m => m.mesh));
        this.selected = allModules.find(m => m.mesh === meshSelected);
        if (this.selected != null) {
            this.notify({ type: "SELECTED", obj: this.selected });
        }
    }
}