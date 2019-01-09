import {Renderer} from "./renderer";
import {Vector3} from "three";
import {SmartDoc} from "./html/smart-doc";
import {KitchenApi} from "../model/kitchen/api";
import {Events} from "./html/events";
import {MouseTracker} from "../utils/mouseTracker";
import {Actions} from "../controller/actions";
import {RendererFactory} from "./rendererFactory";
import {ControlsFactory} from "../controller/controlsFactory";
import {FunctionsPanel} from "./functionsPanel";
import {ControlsPanel} from "./controlsPanel";
import {Controls} from "../controller/controls";
import {GuiPanel} from "./guiPanel";

export class Page {

    private readonly doc = new SmartDoc(document);

    private readonly guiPanel:GuiPanel;
    private readonly controlsPanel: ControlsPanel;
    private readonly functionsPanel: FunctionsPanel;
    //TODO encapsulate canvas
    private readonly renderer: Renderer;

    constructor(
        rendererFactory: RendererFactory,
        controlsFactory: ControlsFactory,
        actions: Actions,
        kitchenApi: KitchenApi
    ) {
        this.guiPanel = new GuiPanel(this.doc, actions);
        this.functionsPanel = new FunctionsPanel(this.doc);

        const canvasContainer = this.doc.getElementById("canvasContainer");

        this.renderer = rendererFactory.create(
            canvasContainer.offsetWidth,
            canvasContainer.offsetHeight
        );

        const canvas = this.renderer.canvas();

        canvasContainer.appendChild(canvas);

        const mouseTracker = new MouseTracker(canvas);

        Events.onClick(canvas, () => actions.selectModule(mouseTracker.xy()));

        const controls = controlsFactory.create(canvas);
        this.controlsPanel = new ControlsPanel(controls, this.doc);

        Events.onClick(
            this.doc.getElementById("drawKitchenButton"),
            () => this.loadKitchenAndSetControls(actions, controls)
        );

        kitchenApi.onAddModule(msg => this.guiPanel.addModuleToModuleList(msg.obj));

        kitchenApi.onRemoveAll(() => this.guiPanel.clear());

        kitchenApi.onModuleChanged(msg => {
            this.functionsPanel.clear();
            this.functionsPanel.fillFunctionsList(msg.obj);
        });

        kitchenApi.onLoad(() => {
            kitchenApi.onModuleSelected(msg => {
                const objElement = this.doc.getElementById(msg.obj.id);
                if (objElement !== null) {
                    objElement.className = "selectedModule";
                }
                this.functionsPanel.fillFunctionsList(msg.obj);
            });

            kitchenApi.onModuleDeselected(msg => {
                const objElement = this.doc.getElementById(msg.obj.id);
                if (objElement !== null) {
                    objElement.className = "";
                }
                this.functionsPanel.clear();
            });
        })
    }

    private loadKitchenAndSetControls(actions: Actions, controls: Controls) {
        const dims = this.guiPanel.kitchenDimensions();

        actions.loadKitchen(dims, this.guiPanel.guiCheckboxesValues());
        //TODO setTarget on kitchen loaded event
        controls.setTarget(new Vector3(0, dims.height / 2, 0));
    }

    public render() {
        this.renderer.render();
    }
}

