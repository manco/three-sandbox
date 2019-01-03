import {ModuleType} from "../model/modules/types";
import {ModuleTypesAll} from "../model/modules/types";
import {ModuleSubtypesOfTypes} from "../model/modules/types";
import {Renderer} from "./renderer";
import {Camera} from "./camera";
import {Scene} from "three";
import {Vector3} from "three";
import {SmartDoc} from "./html/smart-doc";
import {KitchenApi} from "../model/kitchen/api";
import {Html} from "./html/dom";
import {Events} from "./html/events";
import {MouseTracker} from "../utils/mouseTracker";
import {ModuleSelector} from "../module-selector";
import {TextureType} from "../model/textures";
import {Actions} from "../actions";
import {Controls} from "./controls";
import {Labels} from "./labels";

//TODO

//1. Page/View should only know model events and controller actions
//2. Controller exposes actions to view
//3. Controller changes model
//4. model broadcasts events (view listens)
export class Page {

    private readonly doc = new SmartDoc(document);

    public readonly guiPanel: HTMLElement = this.doc.getElementById("gui-panel");
    public readonly controlsPanel: HTMLElement = this.doc.getElementById("controls");

    public readonly buttonZoomIn : HTMLElement = this.controlsPanel.querySelector('button[id=\"zoomin\"]');
    public readonly buttonZoomOut : HTMLElement = this.controlsPanel.querySelector('button[id=\"zoomout\"]');
    public readonly buttonCenter : HTMLElement = this.controlsPanel.querySelector('button[id=\"center\"]');

    public readonly buttonPanLeft : HTMLElement = this.controlsPanel.querySelector('button[id=\"panleft\"');
    public readonly buttonPanRight : HTMLElement = this.controlsPanel.querySelector('button[id=\"panright\"');

    public readonly buttonRotateLeft : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotateleft\"');
    public readonly buttonRotateRight : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotateright\"');
    public readonly buttonRotateUp : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotateup\"');
    public readonly buttonRotateDown : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotatedown\"');

    private readonly renderer: Renderer;

    //TODO moduleSelector doesn't fit here
    constructor(scene: Scene, camera: Camera, actions: Actions, kitchenApi: KitchenApi, moduleSelector: ModuleSelector) {
        const canvasContainer = this.doc.getElementById("canvasContainer");

        this.renderer = new Renderer(
            scene,
            camera,
            canvasContainer.offsetWidth,
            canvasContainer.offsetHeight
        );

        const canvas = this.renderer.canvas();

        canvasContainer.appendChild(canvas);

        const mouseTracker = new MouseTracker(canvas);

        Events.onClick(canvas, () => moduleSelector.selectModule(mouseTracker.xy(), camera));

        Events.onClick(
            this.doc.getElementById("drawKitchenButton"),
            () => {
                const [width, depth, height]: [number, number, number] = [
                    this.doc.getInputNumberValue("kitchen-width"),
                    this.doc.getInputNumberValue("kitchen-depth"),
                    this.doc.getInputNumberValue("kitchen-height")
                ];
                actions.loadKitchen([width, depth, height], this.guiCheckboxesValues());

                //move it to constructor, on event only reset controls target?
                const controls = new Controls(
                    camera,
                    canvas,
                    new Vector3(0, height / 2, 0)
                );

                Events.onClick(this.buttonZoomIn, () => controls.zoomIn());
                Events.onClick(this.buttonZoomOut, () => controls.zoomOut());
                Events.onClick(this.buttonPanLeft, () => controls.panLeft());
                Events.onClick(this.buttonPanRight, () => controls.panRight());
                Events.onClick(this.buttonRotateLeft, () => controls.rotateLeft());
                Events.onClick(this.buttonRotateRight, () => controls.rotateRight());
                Events.onClick(this.buttonRotateUp, () => controls.rotateUp());
                Events.onClick(this.buttonRotateDown, () => controls.rotateDown());
                Events.onClick(this.buttonCenter, () => controls.reset());
            }
        );

        ModuleTypesAll.forEach(t => {

            const ul = this.doc.createUl(`modulesList-${t}`);

            const label = this.doc.createLabel(ul, Labels.ModuleTypesLabels.get(t));

            const buttonChooseColor = this.doc.createButton("kolor");

            Events.onClick(buttonChooseColor, () => actions.changeColor(t, TextureType.WOOD));

            //should be grouped in div and group exposed via view API
            this.guiPanel.appendChild(label);
            this.guiPanel.appendChild(buttonChooseColor);
            this.guiPanel.appendChild(ul);
        });

        kitchenApi.onAddModule(msg => {
                const objId = `${msg.obj.id}`;
                const li = this.doc.createLi(objId);

                const options = ModuleSubtypesOfTypes.get(msg.obj.type)
                    .map(stype => {
                        return {
                            value: `${stype}`,
                            text: Labels.ModuleSubtypesLabels.get(stype)
                        }
                    });

                li.appendChild(Html.select(this.doc, options));

                Events.onClick(li, () => moduleSelector.selectModuleById(objId));
                this.getModulesList(msg.obj.type).appendChild(li);
        });

        kitchenApi.onRemoveAll(() => {
            this.getAllModulesLists().forEach((ml:Element) => ml.innerHTML = '');
        });

        kitchenApi.onLoad(() => {
            moduleSelector.subscribe(msg => {
                const objElement = this.doc.getElementById(msg.obj.id);
                if (objElement !== null) {
                    if (msg.type === "DESELECTED") {
                        objElement.className = "";
                    }
                    if (msg.type === "SELECTED") {
                        objElement.className = "selectedModule";
                    }
                }
            });
        })
    }

    private getModulesList(type: ModuleType): HTMLElement {
        return this.doc.getElementById('modulesList-' + type);
    }

    private getAllModulesLists(): HTMLElement[] {
        return this.doc.findByIdPrefix('modulesList-');
    }

    private guiCheckboxesValues(): string[] {
        return this.doc.findByIdPrefix('checkbox-wall')
            .filter(c => c.checked)
            .map(w => w.value);
    }

    public render() {
        this.renderer.render();
    }



}

