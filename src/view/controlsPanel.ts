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
        const buttonUndo = panel.querySelector('button[id=\"undo\"]');

        const buttonsByMouseMode = new Map<MouseMode, Element>([
            [MouseMode.PAN_ONLY, buttonModePan],
            [MouseMode.ROTATE_ONLY, buttonModeRotate]
        ]);

        controls.subscribe(msg => {
            switch(msg.type) {
                case "UNSET":
                    buttonsByMouseMode.get(msg.obj).classList.remove("selected");
                    break;
                case "SET":
                    buttonsByMouseMode.get(msg.obj).classList.add("selected");
                    break;
                default:
                    break;
            }
        });

        Events.onClick(buttonZoomIn, () => controls.zoomIn());
        Events.onClick(buttonZoomOut, () => controls.zoomOut());
        Events.onClick(buttonModePan, () => controls.toggleMouseMode(MouseMode.PAN_ONLY));
        Events.onClick(buttonModeRotate, () => controls.toggleMouseMode(MouseMode.ROTATE_ONLY));
        Events.onClick(buttonCenter, () => controls.switch2d3d());
        Events.onClick(buttonUndo, () => controls.undo());
    }
}
