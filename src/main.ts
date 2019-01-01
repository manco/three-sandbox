import ModulesLibrary from './model/modules/modules-library'
import {Kitchen} from './model/kitchen/kitchen'
import {Camera} from "./view/camera";
import {SceneFactory} from "./model/scene";
import {ModuleSelector} from './module-selector';
import {Vector3} from "three";
import {Page} from "./view/page";
import {Controls} from "./view/controls";
import {ModuleType} from "./model/modules/types";
import {TexturesLibrary} from "./model/textures";
import {TextureType} from "./model/textures";
import {Events} from "./view/html/events";
import {KitchenApi} from "./model/kitchen/api";
import {Actions} from "./actions";

const scene = SceneFactory.create();

const camera = new Camera(scene);

const modulesLibrary = new ModulesLibrary();
const texturesLibrary = new TexturesLibrary();

const kitchen = new Kitchen(modulesLibrary, texturesLibrary, scene);
// @ts-ignore
window.kitchen = kitchen;

const moduleSelector = new ModuleSelector(kitchen);

const view = new Page(scene, camera, new Actions(kitchen), new KitchenApi(kitchen), moduleSelector);

const init = ():void => {

    const loadKitchen = ():void => {

        const [ width, depth, height ]: [number, number, number] = [
            (document.getElementById("kitchen-width") as HTMLInputElement).valueAsNumber,
            (document.getElementById("kitchen-depth") as HTMLInputElement).valueAsNumber,
            (document.getElementById("kitchen-height") as HTMLInputElement).valueAsNumber
        ];

        //TODO move to Page
        const controls = new Controls(
            camera,
            view.canvas,
            new Vector3(0, height / 2, 0)
        );

        Events.onClick(view.buttonZoomIn, () => camera.zoomIn());
        Events.onClick(view.buttonZoomOut, () => camera.zoomOut());
        Events.onClick(view.buttonPanLeft, () => controls.panLeft());
        Events.onClick(view.buttonPanRight, () => controls.panRight());
        Events.onClick(view.buttonRotateLeft, () => controls.rotateLeft());
        Events.onClick(view.buttonRotateRight, () => controls.rotateRight());
        Events.onClick(view.buttonRotateUp, () => controls.rotateUp());
        Events.onClick(view.buttonRotateDown, () => controls.rotateDown());
        Events.onClick(view.buttonCenter, () => controls.reset());

        kitchen.removeAll();
        kitchen.initFloorAndWalls(width, height, depth, view.guiCheckboxesValues());


        moduleSelector.subscribe(msg => {
            const objElement = document.getElementById(msg.obj.id);
            if (objElement !== null) {
                if (msg.type === "DESELECTED") {
                    objElement.className = "";
                }
                if (msg.type === "SELECTED") {
                    objElement.className = "selectedModule";
                }
            }
        });
    };
    Events.onClick(document.getElementById("drawKitchenButton"), loadKitchen);

    modulesLibrary.loadPrototypes([
        { url: 'models/szafka_dol.obj', type: ModuleType.STANDING },
        { url: 'models/blat.obj', type: ModuleType.TABLETOP },
        { url: 'models/szafka_gora.obj', type: ModuleType.HANGING }
    ]);

    texturesLibrary.loadTextures([
        { url: 'textures/black.jpg', type: TextureType.BLACK },
        { url: 'textures/gray.jpg', type: TextureType.GRAY },
        { url: 'textures/wood.jpg', type: TextureType.WOOD },
        { url: 'textures/gray-light.jpg', type: TextureType.WHITE}
    ]);
};

const animate = ():void => {
    requestAnimationFrame( animate );
    view.render();
};

init();
animate();

