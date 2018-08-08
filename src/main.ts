import {ModulesLibrary} from './modules'
import {Floor, Kitchen, wallsFactories} from './kitchen'
import {MouseTracker} from "./utils/mouseTracker";
import {Renderer} from "./renderer";
import {Camera} from "./camera";
import {ModuleTypesAll} from "./modules";
import {SceneFactory} from "./scene";
import {ControlsInitialzer} from "./controls";
import {ModuleSelector} from './module-selector';
import {Mesh} from "three";

const scene = SceneFactory.create();

const camera = new Camera(scene);

const renderer = new Renderer(scene, camera);

ControlsInitialzer.initControls(camera, renderer);

const modulesLibrary = new ModulesLibrary();
const kitchen : Kitchen = new Kitchen(modulesLibrary, scene);

const mouseTracker = new MouseTracker(renderer.canvas());

const moduleSelector : ModuleSelector = new ModuleSelector(camera, kitchen, mouseTracker);

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
            .filter((c:HTMLInputElement) => c.checked)
            .map((w:HTMLInputElement) => w.value);

        kitchen.removeAll();

        const floor = new Floor(width, depth,
            (m:Mesh):void => { m.translateZ(depth /2) },
            (m:Mesh):void => { m.rotateX(- Math.PI / 2 ) }
        );
        kitchen.setFloor(floor);

        const factories = wallsFactories(width, depth, height);

        chosenWallNames.forEach((wallName:string) => {
            const wall = factories.get(wallName)();
            kitchen.addWall(wall);
            kitchen.fillWallWithModules(wall);
        })
    };
    document.getElementById("drawKitchenButton").addEventListener('click', loadKitchen);
    renderer.canvas().addEventListener('dblclick', () => camera.centerCamera());

    modulesLibrary.loadPrototypes([
        { url: 'models/szafka_dol.obj', type: "STANDING" },
        { url: 'models/blat.obj', type: "TABLETOP" },
        { url: 'models/szafka_gora.obj', type: "HANGING" }
    ]);

    mouseTracker.registerMouseMoveListener();
    renderer.canvas().addEventListener('click', () => moduleSelector.selectModule(), false);

    kitchen.subscribe((msg) => {
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

    moduleSelector.subscribe((msg) => {
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

const animate = ():void => {
    requestAnimationFrame( animate );
    camera.lookAtScene();
    renderer.render();
};

init();
animate();