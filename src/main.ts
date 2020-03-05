import ModulesFactory from './model/modules/modules-factory'
import {Kitchen} from './model/kitchen/kitchen'
import {CameraFactory} from "./model/cameraFactory";
import {SceneFactory} from "./model/scene";
import {ModuleSelector} from './model/module-selector';
import {Page} from "./view/page";
import {ColorTypeLibrary} from "./model/colors";
import {KitchenApi} from "./model/kitchen/api";
import {Actions} from "./controller/actions";
import {RendererFactory} from "./view/rendererFactory";
import {ControlsFactory} from "./controller/controlsFactory";
import {FrontsLibrary} from "./model/modules/module-functions";
import {MeshFactory} from "./utils/meshes-factory";
import {Module} from "./model/modules/module";
import {Stack} from "./model/stack";
import {Slot} from "./model/kitchen/kitchen";
import ObstacleFactory from "./model/kitchen/obstacle-factory";

// @ts-ignore
window.THREE = THREE;

const meshFactory = new MeshFactory();
const modulesLibrary = new ModulesFactory(meshFactory);
const obstacleFactory = new ObstacleFactory(meshFactory);

const scene = SceneFactory.create();
// @ts-ignore
window.scene = scene;

const colorTypeLibrary = new ColorTypeLibrary();
const kitchen = new Kitchen(obstacleFactory, modulesLibrary, colorTypeLibrary, new FrontsLibrary(colorTypeLibrary), scene);
// @ts-ignore
window.kitchen = kitchen;

const moduleSelector = new ModuleSelector();
//debug
moduleSelector.subscribe(msg => {
    if (msg.type === "SELECTED") {
        console.log(msg.obj)
    }
});

const camera = CameraFactory.create(scene);
const actions = new Actions(kitchen, moduleSelector, camera, new Stack<[Module, Slot]>(), new Array<[Slot, Module[]]>());

//@ts-ignore
window.actions = actions;
const view = new Page(
    new RendererFactory(scene, camera),
    new ControlsFactory(camera, actions),
    actions,
    new KitchenApi(kitchen, moduleSelector)
);

const animate = ():void => {
    requestAnimationFrame( animate );
    view.render();
};

animate();

