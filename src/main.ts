import {ModulesLibrary, ModuleType} from './modules'
import {Kitchen, wallsFactories} from './kitchen'
import {MouseTracker} from "./utils/mouseTracker";
import {Renderer} from "./renderer";
import {Camera} from "./camera";
import {SceneFactory} from "./scene";
import {ModuleSelector} from './module-selector';
import {Vector3} from "three";
import {View} from "./view";
import {Controls} from "./controls";

const scene = SceneFactory.create();

const camera = new Camera(scene);
// @ts-ignore
window.camera = camera;


const modulesLibrary = new ModulesLibrary();

const initRenderer = () => {
    const canvasContainer = document.getElementById("canvasContainer");

    const r = new Renderer(
        scene,
        camera,
        canvasContainer.offsetWidth,
        canvasContainer.offsetHeight
    );

    canvasContainer.appendChild( r.canvas() );

    return r;
};

const renderer = initRenderer();
const mouseTracker = new MouseTracker(renderer.canvas());

const init = ():void => {

    const view = new View();

    const loadKitchen = ():void => {

        const [ width, depth, height ]: [number, number, number] = [
            (document.getElementById("kitchen-width") as HTMLInputElement).valueAsNumber,
            (document.getElementById("kitchen-depth") as HTMLInputElement).valueAsNumber,
            (document.getElementById("kitchen-height") as HTMLInputElement).valueAsNumber
        ];

        const chosenWallNames = [].slice.call(document.getElementsByClassName("gui-checkbox"))
            .filter(c => c.checked)
            .map(w => w.value);


        // @ts-ignore
        if (window.kitchen !== undefined) {
            // @ts-ignore
            window.kitchen.removeAll();
        }

        const kitchen : Kitchen = new Kitchen(modulesLibrary, scene, width, height, depth);
        // @ts-ignore
        window.kitchen = kitchen;

        const controls = new Controls(
            camera,
            renderer,
            kitchen.center.clone().add(new Vector3(0, kitchen.height / 2, 0))
        );
        // @ts-ignore
        window.controls = controls;

        view.buttonZoomIn.addEventListener('click', () => camera.zoomIn());
        view.buttonZoomOut.addEventListener('click', () => camera.zoomOut());

        view.buttonRotateLeft.addEventListener('click', () => controls.rotateLeft());
        view.buttonRotateRight.addEventListener('click', () => controls.rotateRight());
        view.buttonRotateUp.addEventListener('click', () => controls.rotateUp());
        view.buttonRotateDown.addEventListener('click', () => controls.rotateDown());

        view.buttonCenter.addEventListener('click', () => camera.centerCamera());

        const factories = wallsFactories(width, depth, height);

        chosenWallNames.forEach((wallName:string) => {
            const wall = factories.get(wallName)();
            kitchen.addWall(wall);
            kitchen.fillWallWithModules(wall);
        });

        const moduleSelector = new ModuleSelector(camera, kitchen, mouseTracker);

        renderer.canvas().addEventListener('click', () => moduleSelector.selectModule(), false);

        kitchen.subscribe(msg => {
            if (msg.type === "ADD") {
                const objId = `${msg.obj.id}`;
                const li = document.createElement("li");
                li.id = objId;
                li.innerHTML = `${msg.obj.mesh.name}`;
                li.addEventListener('click', () => moduleSelector.selectModuleById(objId));
                document.getElementById('modulesList-' + msg.obj.type).appendChild(li);
            }
            if (msg.type === "REMOVEALL") {
                [].slice.call(document.querySelectorAll('[id^=\"modulesList-\"]'))
                    .forEach((ml:Element) => ml.innerHTML = '');
            }
        });

        moduleSelector.subscribe(msg => {
            const objElement = document.getElementById(msg.obj.id);
            if (objElement != null) {
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

    //** TODO DELETE when https://github.com/manco/three-sandbox/issues/14 closed
    renderer.canvas().addEventListener('dblclick', () => camera.centerCamera());
    //**

    modulesLibrary.loadPrototypes([
        { url: 'models/szafka_dol.obj', type: ModuleType.STANDING },
        { url: 'models/blat.obj', type: ModuleType.TABLETOP },
        { url: 'models/szafka_gora.obj', type: ModuleType.HANGING }
    ]);

    mouseTracker.registerMouseMoveListener();
};

const animate = ():void => {
    requestAnimationFrame( animate );
    renderer.render();
};

init();
animate();

