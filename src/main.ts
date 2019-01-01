import ModulesLibrary from './model/modules/modules-library'
import {Kitchen} from './model/kitchen/kitchen'
import {Camera} from "./view/camera";
import {SceneFactory} from "./model/scene";
import {ModuleSelector} from './module-selector';
import {Page} from "./view/page";
import {ModuleType} from "./model/modules/types";
import {TexturesLibrary} from "./model/textures";
import {TextureType} from "./model/textures";
import {KitchenApi} from "./model/kitchen/api";
import {Actions} from "./actions";

const modulesLibrary = new ModulesLibrary();
modulesLibrary.loadPrototypes([
    { url: 'models/szafka_dol.obj', type: ModuleType.STANDING },
    { url: 'models/blat.obj', type: ModuleType.TABLETOP },
    { url: 'models/szafka_gora.obj', type: ModuleType.HANGING }
]);

const texturesLibrary = new TexturesLibrary();
texturesLibrary.loadTextures([
    { url: 'textures/black.jpg', type: TextureType.BLACK },
    { url: 'textures/gray.jpg', type: TextureType.GRAY },
    { url: 'textures/wood.jpg', type: TextureType.WOOD },
    { url: 'textures/gray-light.jpg', type: TextureType.WHITE}
]);

const scene = SceneFactory.create();

const kitchen = new Kitchen(modulesLibrary, texturesLibrary, scene);
// @ts-ignore
window.kitchen = kitchen;

const view = new Page(
    scene,
    new Camera(scene),
    new Actions(kitchen),
    new KitchenApi(kitchen),
    new ModuleSelector(kitchen)
);

const animate = ():void => {
    requestAnimationFrame( animate );
    view.render();
};

animate();

