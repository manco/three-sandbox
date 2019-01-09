import {SmartDoc} from "./html/smart-doc";
import {Module} from "../model/modules/module";
import {ModuleSubtypeToModuleFunction} from "../model/modules/module-functions";
import {ModuleFunctionsUrls} from "../model/modules/module-functions";

export class FunctionsPanel {

    private readonly panel: HTMLElement;
    private readonly functionsList: HTMLUListElement;

    constructor(
        private readonly doc: SmartDoc
    ) {
        this.panel = doc.getElementById("moduleFunctionDetails");
        this.functionsList = doc.createUl("functions");
        this.panel.appendChild(this.functionsList);
    }

    public clear() {
        this.functionsList.innerHTML = "";
    }

    public fillFunctionsList(module: Module): void {
        const listItems = ModuleSubtypeToModuleFunction.get(module.subtype).map(mf => {
            const li = this.doc.createLi(mf.toString());
            li.innerText = ModuleFunctionsUrls.get(mf);
            return li;
        });
        listItems.forEach(li => this.functionsList.appendChild(li));
    }
}