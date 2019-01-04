import {MeshSelector} from "../utils/mesh-selector";
import {Message, Observable} from "../utils/observable";
import {Kitchen} from "./kitchen/kitchen"
import {Module} from "./modules/module"
import {CameraFactory} from "../view/cameraFactory";
import {Mesh} from "three";
import {Coords} from "../utils/lang";
import {Camera} from "three";

export class ModuleSelector extends Observable {
    private readonly meshSelector: MeshSelector = new MeshSelector();
    private selected: Module = null; //TODO selectedId?
    constructor(private readonly kitchen : Kitchen) {
        super();
    }
    selectModule(xy:Coords, camera:Camera): void {
        this._selectModule((meshes) => this.meshSelector.selectMeshByRaycast(camera, xy, meshes));
    }
    selectModuleById(id:string): void {
        this._selectModule((meshes) => this.meshSelector.selectMeshById(id, meshes));
    }

    private _selectModule(selectMeshFun: (_:Mesh[]) => Mesh): void {
        const allModules = this.kitchen.allModules();
        if (this.selected !== null) {
            this._notifyThat("DESELECTED");
        }
        const meshSelected = selectMeshFun(allModules.map((m:Module) => m.mesh));
        this.selected = allModules.find((m:Module) => m.mesh === meshSelected);
        this.selected = this.selected === undefined ? null : this.selected;
        if (this.selected !== null) {
            this._notifyThat("SELECTED");
        }
    }

    private _notifyThat(event: string) {
        this.notify(new Message(event, this.selected));
    }
}