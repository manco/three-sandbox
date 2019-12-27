import {ObstacleType} from "../model/kitchen/obstacle";
import {SmartDoc} from "./html/smart-doc";
import {Labels} from "./labels";
import {Html} from "./html/dom";
import {Wall} from "../model/kitchen/kitchen";

export class ObstacleInputPanel {

    private readonly _panel: HTMLDivElement;

    constructor(
        private readonly type: ObstacleType,
        private readonly doc: SmartDoc,
    ) {
        this._panel = doc.createDiv();
        const placement = this.createPlacement();

        const label = this.doc.createLabel(placement, Labels.ObstacleTypesLabels.get(type));
        this._panel.appendChild(label);
        this._panel.appendChild(placement);
        this._panel.appendChild(this.br());
    }

    private br() {
        return this.doc.br();
    }

    get panel() { return this._panel };

    private createPlacement(): HTMLDivElement {
        const div = this.doc.createDiv();

        const dimensions = [].concat(
                this.dimInputWithLabel("width", "szerokość"),
                this.br(),
                this.dimInputWithLabel("height", "wysokość")
        );

        const selectWall = Html.select(
            this.doc,
            Wall.Names.map(ObstacleInputPanel.option)
        );

        const distanceHtml = this.dimInputWithLabel("distance", "odległość");

        [].concat(
            dimensions,
            this.br(),
            selectWall,
            this.br(),
            distanceHtml,
            this.br()
        ).forEach(e => div.appendChild(e));
        return div;
    }

    private dimInputWithLabel(id: string, label: string) {
        return Html.dimInputWithLabel(this.doc, id, label);
    }

    private static option(val: string) { return {text:val, value:val} }
}