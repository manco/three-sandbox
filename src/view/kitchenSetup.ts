import {SmartDoc} from "./html/smart-doc";
import {Dimensions3D} from "../model/kitchen/kitchen";
import {Html} from "./html/dom";
import {Wall} from "../model/kitchen/kitchen";

export class KitchenSetup {
    private readonly kitchenWidth;
    private readonly kitchenDepth;
    private readonly kitchenHeight;
    private readonly checkboxes: HTMLInputElement[];

    readonly html:Element[];

    constructor(private readonly doc: SmartDoc) {

        const [wlabel, width] = this.dimInputWithLabel("kitchen-width", "Szerokość");
        const [dlabel, depth] = this.dimInputWithLabel("kitchen-depth", "Długość");
        const [hlabel, height] = this.dimInputWithLabel("kitchen-height", "Wysokość");

        this.kitchenWidth = width;
        this.kitchenDepth = depth;
        this.kitchenHeight = height;
        this.checkboxes = Wall.Names.map(w => this.checkbox(w));

        this.html = [
            wlabel, width, this.doc.br(),
            dlabel, depth, this.doc.br(),
            hlabel, height, this.doc.br()
        ].concat(
            ...this.checkboxes.map(c => [
                this.doc.createLabel(c, `Ściana ${c.value}`),
                c,
                this.doc.br()
            ])
        );

        this.kitchenWidth.value = 500;
        this.kitchenDepth.value = 400;
        this.kitchenHeight.value = 240;
        this.checkboxes.forEach(c => c.checked = true);

    }

    kitchenDimensions():Dimensions3D {
        return new Dimensions3D(
            this.kitchenWidth.valueAsNumber,
            this.kitchenDepth.valueAsNumber,
            this.kitchenHeight.valueAsNumber
    );
    }

    guiCheckboxesValues(): string[] {
        return this.checkboxes
            .filter(c => c.checked)
            .map(w => w.value);
    }

    private checkbox(val: string): HTMLInputElement {
        const htmlInput = this.doc.createInput("checkbox");
        htmlInput.id = val;
        htmlInput.value = val;
        return htmlInput;
    }

    private dimInputWithLabel(id: string, label: string) {
        return Html.dimInputWithLabel(this.doc, id, label);
    }
}