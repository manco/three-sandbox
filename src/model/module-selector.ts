import {MeshSelector} from "../utils/mesh-selector";
import {Message, Observable} from "../utils/observable";
import {Module} from "./modules/module"

export class ModuleSelector extends Observable {
    private readonly meshSelector: MeshSelector = new MeshSelector();
    private selected: Module = null;
    constructor() {
        super();
    }

    selectModule(module:Module): void {
        if (this.selected !== null) {
            this._notifyThat("DESELECTED");
        }
        this.selected = module;
        this.selected = this.selected === undefined ? null : this.selected;
        if (this.selected !== null) {
            this.meshSelector.select(this.selected.mesh);
            this._notifyThat("SELECTED");
        } else {
            this.meshSelector.select(null);
        }
    }

    getSelectedModule() {
        return this.selected;
    }

    private _notifyThat(event: string) {
        this.notify(new Message(event, this.selected));
    }
}