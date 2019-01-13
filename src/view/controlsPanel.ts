import {Controls} from "../controller/controls";
import {MouseMode} from "../controller/controls";
import {SmartDoc} from "./html/smart-doc";
import {Events} from "./html/events";

export class ControlsPanel {

    constructor(controls: Controls, doc: SmartDoc) {

        const panel = doc.getElementById("controls");
        const buttonZoomIn = panel.querySelector('button[id=\"zoomin\"]');
        const buttonZoomOut = panel.querySelector('button[id=\"zoomout\"]');
        const buttonCenter = panel.querySelector('button[id=\"center\"]');
        const buttonModePan = panel.querySelector('button[id=\"modepan\"]');
        const buttonModeRotate = panel.querySelector('button[id=\"moderotate\"]');

        Events.onClick(buttonZoomIn, () => controls.zoomIn());
        Events.onClick(buttonZoomOut, () => controls.zoomOut());
        Events.onClick(buttonModePan, () => controls.setMouseMode(MouseMode.PAN_ONLY));
        Events.onClick(buttonModeRotate, () => controls.setMouseMode(MouseMode.ROTATE_ONLY));
        Events.onClick(buttonCenter, () => controls.reset());
    }
}
