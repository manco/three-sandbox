import {Kitchen} from "../model/kitchen/kitchen";
import {Dimensions} from "../model/kitchen/kitchen";
import {Scene} from "three";
import {Texture} from "three";
import ModulesFactory from "../model/modules/modules-factory";
import {ModuleTypesAll} from "../model/modules/types";
import {ColorTypeLibrary} from "../model/colors";
import {ColorType} from "../model/colors";
import {Meshes} from "./helpers/meshes";
import {Meshes as M} from "../utils/meshes";
import {Modules} from "./helpers/modules";
import {ModuleFunction} from "../model/modules/module-functions";
import {FrontsLibrary} from "../model/modules/module-functions";
import {MeshFactory} from "../utils/meshes-factory";

jest.mock("../model/colors");
jest.mock("../model/modules/module-functions");
jest.mock("../utils/meshes-factory");

//@ts-ignore
MeshFactory.mockImplementation(() => {
    return {
        loadPrototypes: () => Promise.resolve(),
        ofType: () => Meshes.box(),
        create: () => Meshes.box()
    };
});

const slotWidth = M.meshWidthX(Meshes.box());

const modulesFactory = new ModulesFactory(new MeshFactory(), slotWidth);

test('kitchen creates floor, wall and wall modules', () => {

    const scene = new Scene();
    new Kitchen(
        modulesFactory,
        null,
        null,
        scene
    ).initFloorAndWalls(new Dimensions(slotWidth * 4, 1000, 1000), ["A"]);

    const modules = scene.children.filter((m) => m.name === Meshes.DefaultMeshName);
    expect(modules).toHaveLength(ModuleTypesAll.length * 4);

    expect(scene.getObjectByName("Floor")).toBeDefined();
    expect(scene.getObjectByName("WallA")).toBeDefined();
});

test('kitchen can remove everything from scene and indexes', () => {

    const scene = new Scene();
    const kitchen = new Kitchen(
        modulesFactory,
        null,
        null,
        scene
    );

    kitchen.initFloorAndWalls(new Dimensions(slotWidth * 4, 1000, 1000), ["A"]);
    kitchen.removeAll();

    expect(scene.children).toHaveLength(0);
    expect(kitchen.modules.all()).toHaveLength(0);
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


test('kitchen can change module back texture', () => {

    const module = Modules.module();

    const kitchen = new Kitchen(
        modulesFactory,
        new ColorTypeLibrary(),
        new FrontsLibrary(null),
        null
    );

    kitchen.setColor(
        module,
        ColorType.WHITE
    );

    expect(module.getColor()).toBe(color);
});

test('kitchen can change module with front texture of front', () => {

    const module = Modules.moduleWithFront();

    const kitchen = new Kitchen(
        modulesFactory,
        new ColorTypeLibrary(),
        new FrontsLibrary(null),
        null
    );

    kitchen.setModuleFunction(
        module,
        ModuleFunction.BIG_2
    );

    expect(module.getFrontTexture()).toBe(front);
});

test('kitchen can change module-with-front texture of back', () => {

    const module = Modules.moduleWithFront();

    const kitchen = new Kitchen(
        modulesFactory,
        new ColorTypeLibrary(),
        new FrontsLibrary(null),
        null
    );

    kitchen.setColor(
        module,
        ColorType.WHITE
    );

    expect(module.getColor()).toBe(color);
});