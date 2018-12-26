import {ModulesLibrary} from './model/modules/modules-library'
import {Kitchen, wallsFactories} from './model/kitchen/kitchen'
import {MouseTracker} from "./utils/mouseTracker";
import {Camera} from "./view/camera";
import {SceneFactory} from "./view/scene";
import {ModuleSelector} from './module-selector';
import {Vector3} from "three";
import {Page} from "./view/page";
import {Controls} from "./view/controls";
import {ModuleSubtypesOfTypes} from "./model/modules/types";
import {ModuleSubtype} from "./model/modules/types";
import {ModuleType} from "./model/modules/types";

const scene = SceneFactory.create();

const camera = new Camera(scene);
// @ts-ignore
window.camera = camera;

const modulesLibrary = new ModulesLibrary();

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

        const kitchen = new Kitchen(modulesLibrary, scene, width, height, depth);
        // @ts-ignore
        window.kitchen = kitchen;

        const controls = new Controls(
            camera,
            view.canvas,
            kitchen.center.clone().add(new Vector3(0, kitchen.height / 2, 0))
        );
        // @ts-ignore
        window.controls = controls;

        view.buttonZoomIn.addEventListener('click', () => camera.zoomIn());
        view.buttonZoomOut.addEventListener('click', () => camera.zoomOut());

        view.buttonPanLeft.addEventListener('click', () => controls.panLeft());
        view.buttonPanRight.addEventListener('click', () => controls.panRight());

        view.buttonRotateLeft.addEventListener('click', () => controls.rotateLeft());
        view.buttonRotateRight.addEventListener('click', () => controls.rotateRight());
        view.buttonRotateUp.addEventListener('click', () => controls.rotateUp());
        view.buttonRotateDown.addEventListener('click', () => controls.rotateDown());

        view.buttonCenter.addEventListener('click', () => controls.reset());

        //** TODO DELETE when https://github.com/manco/three-sandbox/issues/14 closed
        view.canvas.addEventListener('dblclick', () => controls.reset());
        //**

        const factories = wallsFactories(width, depth, height);

        view.guiCheckboxesValues().forEach((wallName:string) => {
            const wall = factories.get(wallName)();
            kitchen.addWall(wall);
            kitchen.fillWallWithModules(wall);
        });

        const moduleSelector = new ModuleSelector(camera, kitchen, mouseTracker);

        view.canvas.addEventListener('click', () => moduleSelector.selectModule(), false);

        kitchen.subscribe(msg => {
            if (msg.type === "ADD") {
                const objId = `${msg.obj.id}`;
                const li = document.createElement("li") as HTMLLIElement;
                li.id = objId;
                //li.innerHTML = `${msg.obj.mesh.name}`; TODO moze bez tego lepiej?

                const select = document.createElement("select") as HTMLSelectElement;

                ModuleSubtypesOfTypes.get(msg.obj.type)
                    .map((stype:ModuleSubtype) => {
                        const option = document.createElement("option") as HTMLOptionElement;
                        option.value = `${stype}`;
                        option.text = Page.ModuleSubtypesLabels.get(stype);
                        return option;
                    })
                    .forEach(o => select.add(o));

                li.appendChild(select);

                li.addEventListener('click', () => moduleSelector.selectModuleById(objId));
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
    document.getElementById("drawKitchenButton").addEventListener('click', loadKitchen);

    modulesLibrary.loadPrototypes([
        { url: 'models/szafka_dol.obj', type: ModuleType.STANDING },
        { url: 'models/blat.obj', type: ModuleType.TABLETOP },
        { url: 'models/szafka_gora.obj', type: ModuleType.HANGING }
    ]);

    mouseTracker.registerMouseMoveListener();
};

const animate = ():void => {
    requestAnimationFrame( animate );
    view.render();
};

init();
animate();

