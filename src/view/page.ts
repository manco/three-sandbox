import {ModuleType} from "../model/modules/types";
import {ModuleTypesAll} from "../model/modules/types";
import {ModuleSubtypesOfTypes} from "../model/modules/types";
import {Renderer} from "./renderer";
import {Scene} from "three";
import {Vector3} from "three";
import {OrthographicCamera} from "three";
import {SmartDoc} from "./html/smart-doc";
import {KitchenApi} from "../model/kitchen/api";
import {Html} from "./html/dom";
import {Events} from "./html/events";
import {MouseTracker} from "../utils/mouseTracker";
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

    private readonly guiPanel: HTMLElement = this.doc.getElementById("gui-panel");
    private readonly controlsPanel: HTMLElement = this.doc.getElementById("controls");

    private readonly buttonZoomIn : HTMLElement = this.controlsPanel.querySelector('button[id=\"zoomin\"]');
    private readonly buttonZoomOut : HTMLElement = this.controlsPanel.querySelector('button[id=\"zoomout\"]');
    private readonly buttonCenter : HTMLElement = this.controlsPanel.querySelector('button[id=\"center\"]');

    private readonly buttonPanLeft : HTMLElement = this.controlsPanel.querySelector('button[id=\"panleft\"');
    private readonly buttonPanRight : HTMLElement = this.controlsPanel.querySelector('button[id=\"panright\"');

    private readonly buttonRotateLeft : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotateleft\"');
    private readonly buttonRotateRight : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotateright\"');
    private readonly buttonRotateUp : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotateup\"');
    private readonly buttonRotateDown : HTMLElement = this.controlsPanel.querySelector('button[id=\"rotatedown\"');

    private readonly renderer: Renderer;

    constructor(scene: Scene, camera: OrthographicCamera, actions: Actions, kitchenApi: KitchenApi) {
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

        Events.onClick(canvas, () => actions.selectModule(mouseTracker.xy()));

        Events.onClick(
            this.doc.getElementById("drawKitchenButton"),
            () => {
                const [width, depth, height]: [number, number, number] = [
                    this.doc.getInputNumberValue("kitchen-width"),
                    this.doc.getInputNumberValue("kitchen-depth"),
                    this.doc.getInputNumberValue("kitchen-height")
                ];
                actions.loadKitchen([width, depth, height], this.guiCheckboxesValues());

                //TODO move it to constructor, on event only reset controls target?
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

                Events.onClick(li, () => actions.selectModuleById(objId));
                this.getModulesList(msg.obj.type).appendChild(li);
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

