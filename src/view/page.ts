import {ModuleType} from "../model/modules/types";
import {Renderer} from "./renderer";
import {Camera} from "./camera";
import {Scene} from "three";
import {ModuleTypesAll} from "../model/modules/types";
import {ModuleSubtype} from "../model/modules/types";

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

    public readonly guiPanel = document.getElementById("gui-panel");
    public readonly controlsPanel = document.getElementById("controls");
    public readonly canvas;

    public readonly buttonZoomIn = this.controlsPanel.querySelector('button[id=\"zoomin\"]');
    public readonly buttonZoomOut = this.controlsPanel.querySelector('button[id=\"zoomout\"]');
    public readonly buttonCenter = this.controlsPanel.querySelector('button[id=\"center\"]');

    public readonly buttonPanLeft = this.controlsPanel.querySelector('button[id=\"panleft\"');
    public readonly buttonPanRight = this.controlsPanel.querySelector('button[id=\"panright\"');

    public readonly buttonRotateLeft = this.controlsPanel.querySelector('button[id=\"rotateleft\"');
    public readonly buttonRotateRight = this.controlsPanel.querySelector('button[id=\"rotateright\"');
    public readonly buttonRotateUp = this.controlsPanel.querySelector('button[id=\"rotateup\"');
    public readonly buttonRotateDown = this.controlsPanel.querySelector('button[id=\"rotatedown\"');


    private readonly renderer: Renderer;

    constructor(scene: Scene, camera: Camera) {
        const canvasContainer = document.getElementById("canvasContainer");

        this.renderer = new Renderer(
            scene,
            camera,
            canvasContainer.offsetWidth,
            canvasContainer.offsetHeight
        );

        this.canvas = this.renderer.canvas();

        canvasContainer.appendChild(this.canvas);

        ModuleTypesAll.forEach(t => {

            const ul = document.createElement("ul") as HTMLUListElement;
            ul.id = `modulesList-${t}`;

            const label = document.createElement("label") as HTMLLabelElement;
            label.setAttribute("for", ul.id);
            label.innerText = Page.ModuleTypesLabels.get(t);

            const buttonChooseColor = document.createElement("button") as HTMLButtonElement;
            buttonChooseColor.innerText = "kolor";
            buttonChooseColor.addEventListener("click", () => alert("jeszcze nie działa :)"));
            this.guiPanel.appendChild(label);
            this.guiPanel.appendChild(buttonChooseColor);
            this.guiPanel.appendChild(ul);
        });
    }

    public getModulesList(type: ModuleType) {
        return document.getElementById('modulesList-' + type);
    }

    public getAllModulesLists() {
        return Page.toArray(document.querySelectorAll('[id^=\"modulesList-\"]'));
    }

    public guiCheckboxesValues(): string[] {
        return Page.toArray(document.querySelectorAll('[id^=\"checkbox-wall\"'))
            .filter(c => c.checked)
            .map(w => w.value);
    }

    public render() {
        this.renderer.render();
    }

    private static toArray<T>(htmlCollection: NodeListOf<Element>) {
        return [].slice.call(htmlCollection);
    }

}
