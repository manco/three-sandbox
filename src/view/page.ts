import {ModuleType} from "../model/modules/types";
import {ModuleTypesAll} from "../model/modules/types";
import {ModuleTypeToSubtype} from "../model/modules/types";
import {Renderer} from "./renderer";
import {Vector3} from "three";
import {SmartDoc} from "./html/smart-doc";
import {KitchenApi} from "../model/kitchen/api";
import {Html} from "./html/dom";
import {Events} from "./html/events";
import {MouseTracker} from "../utils/mouseTracker";
import {TextureTypesAll} from "../model/textures";
import {TexturesUrls} from "../model/textures";
import {Actions} from "../actions";
import {Labels} from "./labels";
import {RendererFactory} from "./rendererFactory";
import {ControlsFactory} from "./controlsFactory";

export class Page {

    private readonly doc = new SmartDoc(document);

    private readonly guiPanel: HTMLElement = this.doc.getElementById("gui-panel");

    //TODO dedicated class for control panel?
    private readonly controlsPanel: HTMLElement = this.doc.getElementById("controls");

    private readonly buttonZoomIn : HTMLElement = this.controlsPanel.querySelector('button[id=\"zoomin\"]');
    private readonly buttonZoomOut : HTMLElement = this.controlsPanel.querySelector('button[id=\"zoomout\"]');
    private readonly buttonCenter : HTMLElement = this.controlsPanel.querySelector('button[id=\"center\"]');

    private readonly buttonPanLeft : HTMLElement = this.controlsPanel.querySelector('button[id=\"panleft\"]');
    private readonly buttonPanRight : HTMLElement = this.controlsPanel.querySelector('button[id=\"panright\"]');

    private readonly buttonRotateLeft : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotateleft\"]');
    private readonly buttonRotateRight : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotateright\"]');
    private readonly buttonRotateUp : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotateup\"]');
    private readonly buttonRotateDown : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotatedown\"]');

    //TODO encapsulate
    private readonly chooseColorModal = this.doc.getElementById("chooseColorModal");
    private readonly chooseColorModalClose = this.doc.getElementById("chooseColorModalClose");

    private readonly renderer: Renderer;

    constructor(
        rendererFactory: RendererFactory,
        controlsFactory: ControlsFactory,
        actions: Actions,
        kitchenApi: KitchenApi
    ) {

        const modalContent = this.chooseColorModal.querySelector('div[class=\"modal-content\"]');
        TextureTypesAll.forEach( t => {
            const b = this.doc.createButton("");
            b.className = "textureButton";
            b.style.backgroundImage = `url(${TexturesUrls.get(t)})`;
            Events.onClick(b, () => actions.changeColor(ModuleType[b.value], t));
            modalContent.appendChild(b);
        });
        Events.onClick(this.chooseColorModalClose, () => this.chooseColorModal.style.display = "none");
        Events.onClick(window, (event) => {
            if (event.target === this.chooseColorModal) this.chooseColorModal.style.display = "none"
        });

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

        Events.onClick(this.buttonZoomIn, () => controls.zoomIn());
        Events.onClick(this.buttonZoomOut, () => controls.zoomOut());
        Events.onClick(this.buttonPanLeft, () => controls.panLeft());
        Events.onClick(this.buttonPanRight, () => controls.panRight());
        Events.onClick(this.buttonRotateLeft, () => controls.rotateLeft());
        Events.onClick(this.buttonRotateRight, () => controls.rotateRight());
        Events.onClick(this.buttonRotateUp, () => controls.rotateUp());
        Events.onClick(this.buttonRotateDown, () => controls.rotateDown());
        Events.onClick(this.buttonCenter, () => controls.reset());

        Events.onClick(
            this.doc.getElementById("drawKitchenButton"),
            () => this.loadKitchenAndSetControls(actions, controls)
        );

        ModuleTypesAll.forEach(t => this.createModulesListHtml(t));

        kitchenApi.onAddModule(msg => {
            this.addModuleToModuleList(msg, actions);
        });

        kitchenApi.onRemoveAll(() => {
            this.getAllModulesLists().forEach((ml:Element) => ml.innerHTML = '');
        });

        kitchenApi.onLoad(() => {
            kitchenApi.onModuleSelected(msg => {
                const objElement = this.doc.getElementById(msg.obj.id);
                if (objElement !== null) {
                    objElement.className = "selectedModule";
                }
            });

            kitchenApi.onModuleDeselected(msg => {
                const objElement = this.doc.getElementById(msg.obj.id);
                if (objElement !== null) {
                    objElement.className = "";
                }
            });
        })
    }

    private addModuleToModuleList(msg, actions: Actions) {
        const li = this.doc.createLi(`${msg.obj.id}`);

        const options = ModuleTypeToSubtype.get(msg.obj.type)
            .map(stype => {
                return {
                    value: `${stype}`,
                    text: Labels.ModuleSubtypesLabels.get(stype)
                }
            });

        li.appendChild(Html.select(this.doc, options));

        Events.onClick(li, () => actions.selectModuleById(li.id));
        this.getModulesList(msg.obj.type).appendChild(li);
    }

    private createModulesListHtml(t) {
        const ul = this.doc.createUl(`modulesList-${t}`);

        const label = this.doc.createLabel(ul, Labels.ModuleTypesLabels.get(t));

        const buttonChooseColor = this.doc.createButton("kolor");
        Events.onClick(buttonChooseColor, () => {
            this.chooseColorModal.style.display = "block";
            const buttons = Html.toArray(this.chooseColorModal.querySelectorAll('button[class=\"textureButton\"]'));
            buttons.forEach(b => (b as HTMLButtonElement).value = ModuleType[t]);
        });

        this.guiPanel.appendChild(label);
        this.guiPanel.appendChild(buttonChooseColor);
        this.guiPanel.appendChild(ul);
    }

    private loadKitchenAndSetControls(actions: Actions, controls) {
        const [width, depth, height]: [number, number, number] = [
            this.doc.getInputNumberValue("kitchen-width"),
            this.doc.getInputNumberValue("kitchen-depth"),
            this.doc.getInputNumberValue("kitchen-height")
        ];
        actions.loadKitchen([width, depth, height], this.guiCheckboxesValues());

        controls.setTarget(new Vector3(0, height / 2, 0));
    }

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

