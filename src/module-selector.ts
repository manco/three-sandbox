import {MeshSelector} from "./utils/mesh-selector";
import {Message, Observable} from "./utils/observable";
import {Kitchen} from "./kitchen"
import {Module} from "./modules"
import {Camera} from "./camera";
import {MouseTracker} from "./utils/mouseTracker";
import {Mesh} from "three";

export class ModuleSelector extends Observable {
    private readonly meshSelector: MeshSelector;
    private selected: Module = null;
    constructor(camera : Camera, private readonly kitchen : Kitchen, mouseTracker : MouseTracker) {
        super();
        this.meshSelector = new MeshSelector(camera.threeJsCamera, mouseTracker);
    }
    selectModule(): void {
        this._selectModule((meshes) => this.meshSelector.selectMeshByRaycast(meshes));
    }
    selectModuleById(id:string): void {
        this._selectModule((meshes) => this.meshSelector.selectMeshById(id, meshes));
    }

    private _selectModule(selectMeshFun: (_:Mesh[]) => Mesh): void {
        const allModules = this.kitchen.allModules();
        if (this.selected != null) {
            this._notifyThat("DESELECTED");
        }
        const meshSelected = selectMeshFun(allModules.map((m:Module) => m.mesh));
        this.selected = allModules.find((m:Module) => m.mesh === meshSelected);
        if (this.selected != null) {
            this._notifyThat("SELECTED");
        }
    }

    private _notifyThat(event: string) {
        this.notify(new Message(event, this.selected));
    }
}