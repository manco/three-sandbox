import {ModuleSubtype, ModuleType, ModuleTypesAll} from "./modules";
import {Renderer} from "./renderer";
import {Camera} from "./camera";
import {Scene} from "three";

export class View {

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
            this.guiPanel.innerHTML += `<label>${View.ModuleTypesLabels.get(t)}</label><ul id="modulesList-${t}"></ul>`
        });
    }

    public getModulesList(type: string) {
        return document.getElementById('modulesList-' + type);
    }

    public getAllModulesLists() {
        return View.toArray(document.querySelectorAll('[id^=\"modulesList-\"]'));
    }

    public guiCheckboxesValues(): string[] {
        return View.toArray(document.querySelectorAll('[id^=\"checkbox-wall\"'))
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

