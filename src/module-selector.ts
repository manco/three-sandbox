import {MeshSelector} from "./utils/mesh-selector";
import {Observable} from "./utils/observable";
import {Kitchen} from "./kitchen"
import {Module} from "./modules"
import {Camera} from "./camera";
import {MouseTracker} from "./utils/mouseTracker";

export class ModuleSelector extends Observable {
    private meshSelector: MeshSelector;
    private kitchen: Kitchen;
    private selected: Module;
    constructor(camera : Camera, kitchen : Kitchen, mouseTracker : MouseTracker) {
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

    private _selectModule(selectMeshFun) {
        const allModules: Module[] = this.kitchen.allModules();
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