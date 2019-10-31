import {Controls} from "../controller/controls";
import {MouseMode} from "../controller/controls";
import {SmartDoc} from "./html/smart-doc";
import {Events} from "./html/events";

export class ControlsPanel {

    constructor(controls: Controls, doc: SmartDoc) {

        const panel = doc.getElementById("controls");
        const buttonZoomIn = panel.querySelector('button[id=\"zoomin\"]');
        const buttonZoomOut = panel.querySelector('button[id=\"zoomout\"]');
        const buttonSwitch2d3d = panel.querySelector('button[id=\"switch2d3d\"]');
        const buttonModePan = panel.querySelector('button[id=\"modepan\"]');
        const buttonModeRotate: HTMLButtonElement = panel.querySelector('button[id=\"moderotate\"]');
        const buttonUndo = panel.querySelector('button[id=\"undo\"]');

        const buttonsByMouseMode = new Map<MouseMode, Element>([
            [MouseMode.PAN_ONLY, buttonModePan],
            [MouseMode.ROTATE_ONLY, buttonModeRotate]
        ]);

        controls.subscribe(msg => {
            const element = buttonsByMouseMode.get(msg.obj);
            if (element !== undefined) {
                switch(msg.type) {
                    case "UNSET":
                        element.classList.remove("selected");
                        break;
                    case "SET":
                        element.classList.add("selected");
                        break;
                    default:
                        break;
                }
            }
        });

        Events.onClick(buttonZoomIn, () => controls.zoomIn());
        Events.onClick(buttonZoomOut, () => controls.zoomOut());
        Events.onClick(buttonModePan, () => controls.toggleMouseMode(MouseMode.PAN_ONLY));
        Events.onClick(buttonModeRotate, () => controls.toggleMouseMode(MouseMode.ROTATE_ONLY));
        Events.onClick(buttonSwitch2d3d, () => controls.switch2d3d());

        controls.subscribe(msg => {
            switch(msg.type) {
                case "SET_VIEW_3D":
                    buttonSwitch2d3d.classList.remove("icon-3d");
                    buttonSwitch2d3d.classList.add("icon-2d");
                    controls.toggleMouseMode(MouseMode.NONE);
                    buttonModeRotate.disabled = false;
                    break;
                case "SET_VIEW_2D":
                    buttonSwitch2d3d.classList.remove("icon-2d");
                    buttonSwitch2d3d.classList.add("icon-3d");
                    controls.toggleMouseMode(MouseMode.NONE);
                    buttonModeRotate.disabled = true;
                    break;
                default:
                    break;
            }
        });

        Events.onClick(buttonUndo, () => controls.undo());
    }
}
