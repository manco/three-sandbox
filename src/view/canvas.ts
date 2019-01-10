import {RendererFactory} from "./rendererFactory";
import {MouseTracker} from "../utils/mouseTracker";
import {Events} from "./html/events";
import {SmartDoc} from "./html/smart-doc";
import {Renderer} from "./renderer";
import {Actions} from "../controller/actions";

export class Canvas {

    private readonly renderer: Renderer;

    constructor(rendererFactory: RendererFactory, actions: Actions, doc: SmartDoc) {
        const canvasContainer = doc.getElementById("canvasContainer");

        this.renderer = rendererFactory.create(
            canvasContainer.offsetWidth,
            canvasContainer.offsetHeight
        );

        const canvas = this.renderer.canvas();

        canvasContainer.appendChild(canvas);

        const mouseTracker = new MouseTracker(canvas);

        Events.onClick(canvas, () => actions.selectModule(mouseTracker.xy()));
    }

    canvas(): HTMLCanvasElement { return this.renderer.canvas(); }

    render():void {
        this.renderer.render();
    }
}