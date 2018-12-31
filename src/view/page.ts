import {ModuleType} from "../model/modules/types";
import {ModuleTypesAll} from "../model/modules/types";
import {ModuleSubtype} from "../model/modules/types";
import {Renderer} from "./renderer";
import {Camera} from "./camera";
import {Scene} from "three";
import {SmartDoc} from "./html/smart-doc";

//TODO

//1. Page/View should only know model events and controller actions
//2. Controller exposes actions to view
//3. Controller changes model
//4. model broadcasts events (view listens)
export class Page {

    public static readonly ModuleSubtypesLabels = new Map<ModuleSubtype, string>([
        [ModuleSubtype.SHELVES, "półki"],
        [ModuleSubtype.DRAWERS, "szuflady"],
        [ModuleSubtype.TABLETOP, "blat"],
        [ModuleSubtype.SINK, "zlewozmywak"],
        [ModuleSubtype.OVEN, "piekarnik"],
        [ModuleSubtype.OVEN_TABLETOP, "palniki"],
        [ModuleSubtype.WASHER, "pralka"],
        [ModuleSubtype.FRIDGE, "lodówka"]
    ]);

    public static readonly ModuleTypesLabels = new Map<ModuleType, string>([
        [ModuleType.STANDING, "SZAFKI STOJĄCE"],
        [ModuleType.TABLETOP, "BLAT KUCHENNY"],
        [ModuleType.HANGING, "SZAFKI WISZĄCE"]
    ]);

    private readonly doc = new SmartDoc(document);

    public readonly guiPanel: HTMLElement = this.doc.getElementById("gui-panel");
    public readonly controlsPanel: HTMLElement = this.doc.getElementById("controls");
    public readonly canvas: HTMLCanvasElement;

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

    constructor(scene: Scene, camera: Camera) {
        const canvasContainer = this.doc.getElementById("canvasContainer");

        this.renderer = new Renderer(
            scene,
            camera,
            canvasContainer.offsetWidth,
            canvasContainer.offsetHeight
        );

        this.canvas = this.renderer.canvas();

        canvasContainer.appendChild(this.canvas);

        ModuleTypesAll.forEach(t => {

            const ul = this.doc.createUl(`modulesList-${t}`);

            const label = this.doc.createLabel(ul, Page.ModuleTypesLabels.get(t));

            const buttonChooseColor = this.doc.createButton("kolor");

            // should be registered after kitchen loaded
            //Events.onClick(buttonChooseColor, () => actions.changeColor(t, TextureType.WOOD));

            //should be grouped in div and group exposed via view API
            this.guiPanel.appendChild(label);
            this.guiPanel.appendChild(buttonChooseColor);
            this.guiPanel.appendChild(ul);
        });
    }

    public getModulesList(type: ModuleType): HTMLElement {
        return this.doc.getElementById('modulesList-' + type);
    }

    public getAllModulesLists(): HTMLElement[] {
        return this.doc.findByIdPrefix('modulesList-');
    }

    public guiCheckboxesValues(): string[] {
        return this.doc.findByIdPrefix('checkbox-wall')
            .filter(c => c.checked)
            .map(w => w.value);
    }

    public render() {
        this.renderer.render();
    }



}

