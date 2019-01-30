import ModulesLibrary from './model/modules/modules-library'
import {Kitchen} from './model/kitchen/kitchen'
import {CameraFactory} from "./model/cameraFactory";
import {SceneFactory} from "./model/scene";
import {ModuleSelector} from './model/module-selector';
import {Page} from "./view/page";
import {ModuleType} from "./model/modules/types";
import {ColorTypeLibrary} from "./model/colors";
import {KitchenApi} from "./model/kitchen/api";
import {Actions} from "./controller/actions";
import {RendererFactory} from "./view/rendererFactory";
import {ControlsFactory} from "./controller/controlsFactory";

const modulesLibrary = new ModulesLibrary();
modulesLibrary.loadPrototypes([
    { url: 'models/szafka_dol.obj', type: ModuleType.STANDING },
    { url: 'models/blat.obj', type: ModuleType.TABLETOP },
    { url: 'models/szafka_gora.obj', type: ModuleType.HANGING }
]);

const colorsLibrary = new ColorTypeLibrary();

const scene = SceneFactory.create();

const kitchen = new Kitchen(modulesLibrary, colorsLibrary, scene);
// @ts-ignore
window.kitchen = kitchen;

const moduleSelector = new ModuleSelector();

const camera = CameraFactory.create(scene);

const view = new Page(
    new RendererFactory(scene, camera),
    new ControlsFactory(camera),
    new Actions(kitchen, moduleSelector, camera),
    new KitchenApi(kitchen, moduleSelector)
);

const animate = ():void => {
    requestAnimationFrame( animate );
    view.render();
};

animate();

