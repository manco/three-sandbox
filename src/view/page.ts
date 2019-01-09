import {ModuleType} from "../model/modules/types";
import {ModuleTypesAll} from "../model/modules/types";
import {ModuleTypeToSubtype} from "../model/modules/types";
import {ModuleSubtype} from "../model/modules/types";
import {Renderer} from "./renderer";
import {Vector3} from "three";
import {SmartDoc} from "./html/smart-doc";
import {KitchenApi} from "../model/kitchen/api";
import {Html} from "./html/dom";
import {Events} from "./html/events";
import {MouseTracker} from "../utils/mouseTracker";
import {Actions} from "../controller/actions";
import {Labels} from "./labels";
import {RendererFactory} from "./rendererFactory";
import {ControlsFactory} from "../controller/controlsFactory";
import {Module} from "../model/modules/module";
import {ColorModal} from "./colorModal";
import {FunctionsPanel} from "./functionsPanel";
import {ControlsPanel} from "./controlsPanel";
import {Controls} from "../controller/controls";

export class Page {

    private readonly doc = new SmartDoc(document);

    private readonly guiPanel: HTMLElement = this.doc.getElementById("gui-panel");
    private readonly controlsPanel: ControlsPanel;
    private readonly colorModal:ColorModal;
    private readonly functionsPanel: FunctionsPanel;

    private readonly renderer: Renderer;

    constructor(
        rendererFactory: RendererFactory,
        controlsFactory: ControlsFactory,
        actions: Actions,
        kitchenApi: KitchenApi
    ) {
        this.colorModal = new ColorModal(this.doc, actions);
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

        ModuleTypesAll.forEach(t => this.createModulesListHtml(t));

        kitchenApi.onAddModule(msg => {
            this.addModuleToModuleList(msg.obj, actions);
        });

        kitchenApi.onRemoveAll(() => {
            this.getAllModulesLists().forEach((ml:Element) => ml.innerHTML = '');
        });

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

    private addModuleToModuleList(module: Module, actions: Actions) {
        const li = this.doc.createLi(`${module.id}`);

        const options = ModuleTypeToSubtype.get(module.type)
            .map(stype => {
                return {
                    value: `${stype}`,
                    text: Labels.ModuleSubtypesLabels.get(stype)
                }
            });

        const selectBox = Html.select(this.doc, options);
        Events.onInputChange(
            selectBox,
            (event) => {
                const inputValue = Number.parseInt((event.target as HTMLSelectElement).value);
                actions.setModuleSubtype(module, ModuleSubtype[ModuleSubtype[inputValue]]);
            }
        );
        li.appendChild(selectBox);

        Events.onClick(li, () => actions.selectModuleById(li.id));
        this.getModulesList(module.type).appendChild(li);
    }

    private createModulesListHtml(moduleType: ModuleType) {
        const ul = this.doc.createUl(`modulesList-${moduleType}`);

        const label = this.doc.createLabel(ul, Labels.ModuleTypesLabels.get(moduleType));

        const buttonChooseColor = this.doc.createButton("kolor");
        Events.onClick(buttonChooseColor, () => {
            this.colorModal.setContext(moduleType);
            this.colorModal.show();
        });

        this.guiPanel.appendChild(label);
        this.guiPanel.appendChild(buttonChooseColor);
        this.guiPanel.appendChild(ul);
    }

    private loadKitchenAndSetControls(actions: Actions, controls: Controls) {
        const [width, depth, height]: [number, number, number] = [
            this.doc.getInputNumberValue("kitchen-width"),
            this.doc.getInputNumberValue("kitchen-depth"),
            this.doc.getInputNumberValue("kitchen-height")
        ];
        actions.loadKitchen([width, depth, height], this.guiCheckboxesValues());

        controls.setTarget(new Vector3(0, height / 2, 0));
    }

    //TODO encapsulate
    private getModulesList(type: ModuleType): HTMLElement {
        return this.doc.getElementById('modulesList-' + type);
    }

    private getAllModulesLists(): HTMLElement[] {
        return this.doc.findByIdPrefix('modulesList-');
    }

    private guiCheckboxesValues(): string[] {
        return this.doc.findByIdPrefix<HTMLInputElement>('checkbox-wall')
            .filter(c => c.checked)
            .map(w => w.value);
    }

    public render() {
        this.renderer.render();
    }
}

