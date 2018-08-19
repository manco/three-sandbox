import {ModulesLibrary, ModuleTypesAll} from './modules'
import {Kitchen, wallsFactories} from './kitchen'
import {MouseTracker} from "./utils/mouseTracker";
import {Renderer} from "./renderer";
import {Camera} from "./camera";
import {SceneFactory} from "./scene";
import {ControlsInitializer} from "./controls";
import {ModuleSelector} from './module-selector';
import {OrbitControls} from "three";

const scene = SceneFactory.create();

const camera = new Camera(scene);
// @ts-ignore
window.camera = camera;

const renderer = new Renderer(scene, camera);

const modulesLibrary = new ModulesLibrary();

const mouseTracker = new MouseTracker(renderer.canvas());

const init = ():void => {

    const guiPanel = document.getElementById("gui-panel");
    ModuleTypesAll.forEach(t => {
        guiPanel.innerHTML += `<label>${t}</label><ul id="modulesList-${t}"></ul>`
    });
    document.getElementById("canvasContainer").appendChild( renderer.canvas() );

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

        const controls: OrbitControls = ControlsInitializer.initControls(camera, renderer, kitchen.center);
        // @ts-ignore
        window.controls = controls;

        const factories = wallsFactories(width, depth, height);

        chosenWallNames.forEach((wallName:string) => {
            const wall = factories.get(wallName)();
            kitchen.addWall(wall);
            kitchen.fillWallWithModules(wall);
        });

        const moduleSelector : ModuleSelector = new ModuleSelector(camera, kitchen, mouseTracker);

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
    renderer.canvas().addEventListener('dblclick', () => camera.centerCamera());

    modulesLibrary.loadPrototypes([
        { url: 'models/szafka_dol.obj', type: "STANDING" },
        { url: 'models/blat.obj', type: "TABLETOP" },
        { url: 'models/szafka_gora.obj', type: "HANGING" }
    ]);

    mouseTracker.registerMouseMoveListener();
};

const animate = ():void => {
    requestAnimationFrame( animate );
    renderer.render();
};

init();
animate();

