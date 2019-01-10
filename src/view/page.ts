import {Vector3} from "three";
import {SmartDoc} from "./html/smart-doc";
import {KitchenApi} from "../model/kitchen/api";
import {Actions} from "../controller/actions";
import {RendererFactory} from "./rendererFactory";
import {ControlsFactory} from "../controller/controlsFactory";
import {FunctionsPanel} from "./functionsPanel";
import {ControlsPanel} from "./controlsPanel";
import {GuiPanel} from "./guiPanel";
import {Canvas} from "./canvas";

export class Page {

    private readonly doc = new SmartDoc(document);

    private readonly canvas: Canvas;
    private readonly guiPanel:GuiPanel;
    private readonly controlsPanel: ControlsPanel;
    private readonly functionsPanel: FunctionsPanel;

    constructor(
        rendererFactory: RendererFactory,
        controlsFactory: ControlsFactory,
        actions: Actions,
        kitchenApi: KitchenApi
    ) {
        this.guiPanel = new GuiPanel(this.doc, actions);
        this.functionsPanel = new FunctionsPanel(this.doc);
        this.canvas = new Canvas(rendererFactory, actions, this.doc);
        const controls = controlsFactory.create(this.canvas.canvas());
        this.controlsPanel = new ControlsPanel(controls, this.doc);

        kitchenApi.onAddModule(msg => this.guiPanel.addModuleToModuleList(msg.obj));

        kitchenApi.onRemoveAll(() => this.guiPanel.clear());

        kitchenApi.onModuleChanged(msg => {
            this.functionsPanel.clear();
            this.functionsPanel.fillFunctionsList(msg.obj);
        });

        kitchenApi.onLoad((msg) => controls.setTarget(new Vector3(0, msg.obj.height / 2, 0)));

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
    }
    public render() {
        this.canvas.render();
    }
}

