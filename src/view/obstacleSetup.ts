import {ObstacleType} from "../model/kitchen/obstacle";
import {Dimensions2D} from "../model/kitchen/obstacle";
import {SmartDoc} from "./html/smart-doc";
import {Labels} from "./labels";
import {Html} from "./html/dom";
import {Wall} from "../model/kitchen/kitchen";

export class ObstacleSetup {

    readonly html: HTMLDivElement;

    private readonly wallInput:HTMLSelectElement;
    private readonly distanceInput:HTMLInputElement;
    private readonly widthInput: HTMLInputElement;
    private readonly heightInput: HTMLInputElement;

    constructor(
        private readonly type: ObstacleType,
        private readonly doc: SmartDoc,
    ) {
        this.html = doc.createDiv();

        const placementDiv = this.doc.createDiv();

        this.distanceInput = this.dimInput("distance");
        this.widthInput = this.dimInput("width");
        this.heightInput = this.dimInput("height");

        this.wallInput = Html.select(
            this.doc,
            Wall.Names.map(ObstacleSetup.option)
        );

        [
            doc.createLabel(this.widthInput, "szerokość"),
            this.widthInput,
            this.br(),
            doc.createLabel(this.heightInput, "wysokość"),
            this.heightInput,
            this.br(),
            this.wallInput,
            this.br(),
            doc.createLabel(this.distanceInput, "odległość"),
            this.distanceInput,
            this.br()
        ].forEach(e => placementDiv.appendChild(e));

        const label = this.doc.createLabel(placementDiv, Labels.ObstacleTypesLabels.get(type));
        this.html.append(label, placementDiv, this.br());
    }

    getDistance():number {
        return this.distanceInput.valueAsNumber;
    }

    getWall():string {
        return this.wallInput.value;
    }

    getDimensions() : Dimensions2D {
        return new Dimensions2D(
            this.widthInput.valueAsNumber,
            this.heightInput.valueAsNumber,
        );
    }

    isValid():boolean {
        return isFinite(this.getDistance()) && this.getDimensions().isValid() && this.getWall() !== undefined
    }

    private br() {
        return this.doc.br();
    }

    private dimInput(id:string) {
        const input = this.doc.createInputOfId(id, "number");
        input.className = "dimensionInput";
        return input;
    }

    private static option(val: string) { return {text:val, value:val} }
}