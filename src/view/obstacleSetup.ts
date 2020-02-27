import {Dimensions2D, ObstacleType, ObstacleTypeAll} from "../model/kitchen/obstacle";
import {SmartDoc} from "./html/smart-doc";
import {Html} from "./html/dom";
import {Wall} from "../model/kitchen/kitchen";
import {Labels} from "./labels";

export class ObstacleSetup {

    readonly html: HTMLDivElement;

    private readonly typeInput:HTMLSelectElement;
    private readonly wallInput:HTMLSelectElement;
    private readonly distanceInput:HTMLInputElement;
    private readonly widthInput: HTMLInputElement;
    private readonly heightInput: HTMLInputElement;

    constructor(
        private readonly doc: SmartDoc
    ) {
        this.html = doc.createDiv();

        const placementDiv = this.doc.createDiv();

        this.distanceInput = this.dimInput("distance");
        this.widthInput = this.dimInput("width");
        this.heightInput = this.dimInput("height");

        this.typeInput = Html.select(
            this.doc,
            ObstacleTypeAll.map(o => ObstacleSetup.optionVT(o, Labels.ObstacleTypesLabels.get(o)))
        );

        this.wallInput = Html.select(
            this.doc,
            Wall.Names.map(ObstacleSetup.optionV)
        );

        [
            this.typeInput,
            this.br(),
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

        // const label = this.doc.createLabel(placementDiv, Labels.ObstacleTypesLabels.get(type));
        this.html.append(/*label, */placementDiv, this.br());
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

    getType(): ObstacleType {
        return ObstacleType[this.typeInput.value];
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

    private static optionV(val: string) { return ObstacleSetup.optionVT(val, val) }
    private static optionVT(val: string, txt:string) { return {text:txt, value:val} }
}