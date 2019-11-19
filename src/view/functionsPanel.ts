import {SmartDoc} from "./html/smart-doc";
import {Module} from "../model/modules/module";
import {Events} from "./html/events";
import {Actions} from "../controller/actions";
import {ModuleSubtypeToModuleFunction} from "../model/modules/types";
import {ModuleFunctionsIcons} from "../model/modules/types";
import {ResizeReason} from "../model/modules/resizing";

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
        this.items(module).forEach(li => this.panel.appendChild(li));
    }

    private items(module: Module) {
        if (module.isCorner() || module.resize.reason == ResizeReason.BLENDE) return [];

        return ModuleSubtypeToModuleFunction.get(module.subtype).map(mf => {
            const div = this.doc.createDiv();
            div.className = "functionInputBgnd";
            div.appendChild(this.imgInput(mf, module));
            return div;
        });
    }

    private imgInput(mf, module: Module) {
        const img = this.doc.createImageInput(ModuleFunctionsIcons.get(mf));
        img.classList.add("functionDetailsInput");
        if (module.moduleFunction === mf) {
            img.classList.add("selectedFunction");
        }
        Events.onClick(img, () => this.actions.setModuleFunction(module, mf));
        return img;
    }
}