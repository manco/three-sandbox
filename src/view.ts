import {ModuleSubtype, ModuleType, ModuleTypesAll} from "./modules";

export class View {

    public static readonly ModuleSubtypesLabels = new Map<ModuleSubtype, string>([
        [ModuleSubtype.SHELVES, "półki"],
        [ModuleSubtype.DRAWERS, "szuflady"],
        [ModuleSubtype.SINK, "zlewozmywak"],
        [ModuleSubtype.OVEN, "piekarnik"],
        [ModuleSubtype.WASHER, "pralka"],
        [ModuleSubtype.FRIDGE, "lodówka"]
    ]);

    public static readonly ModuleTypesLabels = new Map<ModuleType, string>([
        [ModuleType.STANDING, "SZAFKI STOJĄCE"],
        [ModuleType.TABLETOP, "BLAT KUCHENNY"],
        [ModuleType.HANGING, "SZAFKI WISZĄCE"]
    ]);

    public readonly guiPanel;
    public readonly controlsPanel;
    public readonly buttonZoomIn;
    public readonly buttonZoomOut;
    public readonly buttonCenter;

    constructor() {
        this.guiPanel = document.getElementById("gui-panel");
        this.controlsPanel = document.getElementById("controls");
        this.buttonZoomIn = this.controlsPanel.querySelector('button[id=\"zoomin\"]');
        this.buttonZoomOut = this.controlsPanel.querySelector('button[id=\"zoomout\"]');
        this.buttonCenter = this.controlsPanel.querySelector('button[id=\"center\"]');

        ModuleTypesAll.forEach(t => {
            this.guiPanel.innerHTML += `<label>${View.ModuleTypesLabels.get(t)}</label><ul id="modulesList-${t}"></ul>`
        });
    }
}

