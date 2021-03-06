import {Texture} from "three";
import {Scene} from "three";
import {ColorTypeLibrary} from "../model/colors";
import {ColorType} from "../model/colors";
import {FrontsLibrary} from "../model/modules/module-functions";
import {Modules} from "./helpers/modules";
import {Kitchen} from "../model/kitchen/kitchen";
import {Dimensions3D} from "../model/kitchen/kitchen";
import ModulesFactory from "../model/modules/modules-factory";
import {Meshes} from "./helpers/meshes";
import {ModuleType} from "../model/modules/types";
import {ModuleFunction} from "../model/modules/types";
import ObstacleFactory from "../model/kitchen/obstacle-factory";

jest.mock("../model/modules/modules-factory");
jest.mock("../model/colors");
jest.mock("../model/modules/module-functions");

const moduleWithFront = Modules.moduleWithFront(Meshes.box("withF"), ModuleType.STANDING);
//@ts-ignore
ModulesFactory.mockImplementation(() => {
    return {
        createForType: () => moduleWithFront,
        createForTypes: () => Modules.moduleWithFront(Meshes.box("withF2")),
        slotWidth: () => moduleWithFront.width,
        cornerWidth: () => moduleWithFront.width
    };
});

const color = new Texture();
color.name = "color";

const front = new Texture();
front.name = "front";

//@ts-ignore
ColorTypeLibrary.mockImplementation(() => {
    return { get: () => color };
});

//@ts-ignore
FrontsLibrary.mockImplementation(() => {
    return { get: () => front };
});


function createKitchen() {
    return new Kitchen(
        new ObstacleFactory(null),
        new ModulesFactory(null, null),
        new ColorTypeLibrary(),
        new FrontsLibrary(null),
        new Scene()
    );
}

test('kitchen can change module back texture', () => {

    const module = Modules.module();

    createKitchen().setColor(
        module,
        ColorType.WHITE
    );

    expect(module.getColor()).toBe(color);
});

test('kitchen can change module-with-front texture of back', () => {

    const module = Modules.module();

    createKitchen().setColor(
        module,
        ColorType.WHITE
    );

    expect(module.getColor()).toBe(color);
});

test('kitchen can change module with front texture of front', () => {

    const kitchen = createKitchen();

    kitchen.initFloorAndWalls(new Dimensions3D(moduleWithFront.width, 1000, 1000), ["A"], []);

    kitchen.setModuleFunction(
        moduleWithFront,
        ModuleFunction.BIG_2
    );

    const onlyModule = kitchen.modules.all()[0];

    expect(onlyModule.getFrontTexture()).toBe(front);
});