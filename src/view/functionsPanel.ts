import {SmartDoc} from "./html/smart-doc";
import {Module} from "../model/modules/module";
import {ModuleSubtypeToModuleFunction} from "../model/modules/module-functions";
import {ModuleFunctionsUrls} from "../model/modules/module-functions";
import {Events} from "./html/events";
import {Actions} from "../controller/actions";

export class FunctionsPanel {

    private readonly panel: HTMLElement = this.doc.getElementById("moduleFunctionDetails");

    constructor(
        private readonly doc: SmartDoc,
        private readonly actions: Actions
    ) {
    }

    public clear() {
        this.panel.innerHTML = "";
    }

    public fillFunctionsList(module: Module): void {
        const listItems = ModuleSubtypeToModuleFunction.get(module.subtype).map(mf => {
            const div = this.doc.createDiv();
            div.className="functionInputBgnd";
            div.appendChild(this.imgInput(mf, module));
            return div;
        });
        listItems.forEach(li => this.panel.appendChild(li));
    }

    private imgInput(mf, module: Module) {
        const img = this.doc.createImageInput(ModuleFunctionsUrls.get(mf));
        img.classList.add("functionDetailsInput");
        if (module.moduleFunction === mf) {
            img.classList.add("selectedFunction");
        }
        Events.onClick(img, () => this.actions.setModuleFunction(module, mf));
        return img;
    }
}