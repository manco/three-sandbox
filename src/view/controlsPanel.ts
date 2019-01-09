import {Controls} from "../controller/controls";
import {SmartDoc} from "./html/smart-doc";
import {Events} from "./html/events";

export class ControlsPanel {

    constructor(controls: Controls, doc: SmartDoc) {

        const panel = doc.getElementById("controls");
        const buttonZoomIn = panel.querySelector('button[id=\"zoomin\"]');
        const buttonZoomOut = panel.querySelector('button[id=\"zoomout\"]');
        const buttonCenter = panel.querySelector('button[id=\"center\"]');
        const buttonPanLeft = panel.querySelector('button[id=\"panleft\"]');
        const buttonPanRight = panel.querySelector('button[id=\"panright\"]');
        const buttonRotateLeft = panel.querySelector('button[id=\"rotateleft\"]');
        const buttonRotateRight = panel.querySelector('button[id=\"rotateright\"]');
        const buttonRotateUp = panel.querySelector('button[id=\"rotateup\"]');
        const buttonRotateDown = panel.querySelector('button[id=\"rotatedown\"]');

        Events.onClick(buttonZoomIn, () => controls.zoomIn());
        Events.onClick(buttonZoomOut, () => controls.zoomOut());
        Events.onClick(buttonPanLeft, () => controls.panLeft());
        Events.onClick(buttonPanRight, () => controls.panRight());
        Events.onClick(buttonRotateLeft, () => controls.rotateLeft());
        Events.onClick(buttonRotateRight, () => controls.rotateRight());
        Events.onClick(buttonRotateUp, () => controls.rotateUp());
        Events.onClick(buttonRotateDown, () => controls.rotateDown());
        Events.onClick(buttonCenter, () => controls.reset());
    }
}
