import {TextureTypesAll} from "../model/textures";
import {TexturesUrls} from "../model/textures";
import {Events} from "./html/events";
import {SmartDoc} from "./html/smart-doc";
import {ModuleType} from "../model/modules/types";
import {Actions} from "../controller/actions";

export class ColorModal {

    private readonly chooseColorModal;
    private readonly chooseColorModalClose;
    private context: ModuleType = null;

    constructor(doc: SmartDoc, actions: Actions) {

        this.chooseColorModal = doc.getElementById("chooseColorModal");
        this.chooseColorModalClose = doc.getElementById("chooseColorModalClose");

        const modalContent = this.chooseColorModal.querySelector('div[class=\"modal-content\"]');

        TextureTypesAll.forEach( texture => {
            const b = doc.createButton("");
            b.className = "textureButton";
            b.style.backgroundImage = `url(${TexturesUrls.get(texture)})`;
            Events.onClick(b, () => actions.changeColor(this.context, texture));
            modalContent.appendChild(b);
        });

        Events.onClick(this.chooseColorModalClose, () => this.hide());
        Events.onClick(window, (event) => {
            if (event.target === this.chooseColorModal) this.hide()
        });
    }

    setContext(moduleType: ModuleType) {
        this.context = moduleType;
    }

    hide() {
        this.chooseColorModal.style.display = "none"
    }

    show() {
        this.chooseColorModal.style.display = "block";
    }
}