import ModulesLibrary from './model/modules/modules-library'
import {Kitchen} from './model/kitchen/kitchen'
import {MouseTracker} from "./utils/mouseTracker";
import {Camera} from "./view/camera";
import {SceneFactory} from "./model/scene";
import {ModuleSelector} from './module-selector';
import {Vector3} from "three";
import {Page} from "./view/page";
import {Controls} from "./view/controls";
import {ModuleSubtypesOfTypes} from "./model/modules/types";
import {ModuleType} from "./model/modules/types";
import {TexturesLibrary} from "./model/textures";
import {TextureType} from "./model/textures";
import {Html} from "./view/html/dom";
import {Events} from "./view/html/events";

const scene = SceneFactory.create();

const camera = new Camera(scene);
// @ts-ignore
window.camera = camera;

const modulesLibrary = new ModulesLibrary();
const texturesLibrary = new TexturesLibrary();

const view = new Page(scene, camera);

const mouseTracker = new MouseTracker(view.canvas);

const init = ():void => {

    const loadKitchen = ():void => {

        const [ width, depth, height ]: [number, number, number] = [
            (document.getElementById("kitchen-width") as HTMLInputElement).valueAsNumber,
            (document.getElementById("kitchen-depth") as HTMLInputElement).valueAsNumber,
            (document.getElementById("kitchen-height") as HTMLInputElement).valueAsNumber
        ];

        // @ts-ignore
        if (window.kitchen !== undefined) {
            // @ts-ignore
            window.kitchen.removeAll();
        }

        const kitchen = new Kitchen(modulesLibrary, texturesLibrary, scene, width, height, depth);
        // @ts-ignore
        window.kitchen = kitchen;

        const controls = new Controls(
            camera,
            view.canvas,
            kitchen.center.clone().add(new Vector3(0, kitchen.height / 2, 0))
        );
        // @ts-ignore
        window.controls = controls;

        Events.onClick(view.buttonZoomIn, () => camera.zoomIn());
        Events.onClick(view.buttonZoomOut, () => camera.zoomOut());
        Events.onClick(view.buttonPanLeft, () => controls.panLeft());
        Events.onClick(view.buttonPanRight, () => controls.panRight());
        Events.onClick(view.buttonRotateLeft, () => controls.rotateLeft());
        Events.onClick(view.buttonRotateRight, () => controls.rotateRight());
        Events.onClick(view.buttonRotateUp, () => controls.rotateUp());
        Events.onClick(view.buttonRotateDown, () => controls.rotateDown());
        Events.onClick(view.buttonCenter, () => controls.reset());

        //** TODO DELETE when https://github.com/manco/three-sandbox/issues/14 closed
        view.canvas.addEventListener('dblclick', () => controls.reset());
        //**

        kitchen.initFloorAndWalls(view.guiCheckboxesValues());

        const moduleSelector = new ModuleSelector(camera, kitchen, mouseTracker);

        Events.onClick(view.canvas, () => moduleSelector.selectModule());

        kitchen.subscribe(msg => {
            if (msg.type === "ADD") {
                const objId = `${msg.obj.id}`;
                const li = Html.listItem(objId);

                const options = ModuleSubtypesOfTypes.get(msg.obj.type)
                    .map(stype => {
                        return {
                            value: `${stype}`,
                            text: Page.ModuleSubtypesLabels.get(stype)
                        }
                    });

                li.appendChild(Html.select(document, options));

                Events.onClick(li, () => moduleSelector.selectModuleById(objId));
                view.getModulesList(msg.obj.type).appendChild(li);
            }
            if (msg.type === "REMOVEALL") {
                view.getAllModulesLists().forEach((ml:Element) => ml.innerHTML = '');
            }
        });

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

    mouseTracker.registerMouseMoveListener();
};

const animate = ():void => {
    requestAnimationFrame( animate );
    view.render();
};

init();
animate();

