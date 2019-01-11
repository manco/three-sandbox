import {SmartDoc} from "./html/smart-doc";
import {Module} from "../model/modules/module";
import {ModuleSubtypeToModuleFunction} from "../model/modules/module-functions";
import {ModuleFunctionsUrls} from "../model/modules/module-functions";
import {Events} from "./html/events";
import {Actions} from "../controller/actions";

export class FunctionsPanel {

    private readonly panel: HTMLElement = this.doc.getElementById("moduleFunctionDetails");
    private readonly functionsList: HTMLUListElement = this.doc.createUl("functions");

    constructor(
        private readonly doc: SmartDoc,
        private readonly actions: Actions
    ) {
        this.panel.appendChild(this.functionsList);
    }

    public clear() {
        this.functionsList.innerHTML = "";
    }

    public fillFunctionsList(module: Module): void {
        const listItems = ModuleSubtypeToModuleFunction.get(module.subtype).map(mf => {
            const li = this.doc.createLi(mf.toString());
            if (module.moduleFunction === mf) {
                li.className = "selectedFunction";
            }
            li.innerText = ModuleFunctionsUrls.get(mf);
            Events.onClick(li, () => this.actions.setModuleFunction(module, mf));
            return li;
        });
        listItems.forEach(li => this.functionsList.appendChild(li));
    }
}