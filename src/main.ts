import ModulesLibrary from './model/modules/modules-library'
import {Kitchen} from './model/kitchen/kitchen'
import {CameraFactory} from "./view/cameraFactory";
import {SceneFactory} from "./model/scene";
import {ModuleSelector} from './model/module-selector';
import {Page} from "./view/page";
import {ModuleType} from "./model/modules/types";
import {TexturesLibrary} from "./model/textures";
import {TexturesUrls} from "./model/textures";
import {TextureDefinition} from "./model/textures";
import {KitchenApi} from "./model/kitchen/api";
import {Actions} from "./actions";

const modulesLibrary = new ModulesLibrary();
modulesLibrary.loadPrototypes([
    { url: 'models/szafka_dol.obj', type: ModuleType.STANDING },
    { url: 'models/blat.obj', type: ModuleType.TABLETOP },
    { url: 'models/szafka_gora.obj', type: ModuleType.HANGING }
]);

const texturesLibrary = new TexturesLibrary();
texturesLibrary.loadTextures(
    Array.from(TexturesUrls.entries()).map(kv => new TextureDefinition(kv[1], kv[0]))
);

const scene = SceneFactory.create();

const kitchen = new Kitchen(modulesLibrary, texturesLibrary, scene);
// @ts-ignore
window.kitchen = kitchen;

const moduleSelector = new ModuleSelector(kitchen);

const camera = CameraFactory.create(scene);

const view = new Page(
    scene,
    camera,
    new Actions(kitchen, moduleSelector, camera),
    new KitchenApi(kitchen, moduleSelector)
);

const animate = ():void => {
    requestAnimationFrame( animate );
    view.render();
};

animate();

