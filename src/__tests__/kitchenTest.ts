import {Kitchen} from "../model/kitchen/kitchen";
import {Scene} from "three";
import {Texture} from "three";
import ModulesLibrary from "../model/modules/modules-library";
import {ModuleType} from "../model/modules/types";
import {ModuleTypesAll} from "../model/modules/types";
import {TexturesLibrary} from "../model/textures";
import {TextureType} from "../model/textures";
import {Meshes} from "./helpers/meshes";
import {Modules} from "./helpers/modules";

jest.mock("../model/modules/modules-library");
jest.mock("../model/textures");

test('kitchen creates floor, wall and wall modules', () => {

    //@ts-ignore
    ModulesLibrary.mockImplementation(() => {
        const mockModuleFun = (t:ModuleType) => Promise.resolve(Modules.module(t));
        return {
            ofType: mockModuleFun,
            createModule: mockModuleFun
        };
    });

    const scene = new Scene();
    const initFinished = new Kitchen(
        new ModulesLibrary(),
        new TexturesLibrary(),
        scene,
        100,
        150,
        200
    ).initFloorAndWalls(["A"]);

    return initFinished.then(() => {
        expect(scene.getObjectByName("Floor")).toBeDefined();
        expect(scene.getObjectByName("WallA")).toBeDefined();
        expect(scene.children.filter((m) => m.name === Meshes.DefaultMeshName))
            .toHaveLength(ModuleTypesAll.length * 2);
    });
});

test('kitchen can change module texture', () => {

    const texture = new Texture();

    //@ts-ignore
    TexturesLibrary.mockImplementation(() => {
        return { get: () => texture };
    });

    const module = Modules.module();

    const kitchen = new Kitchen(
        null,
        new TexturesLibrary(),
        null,
        100,
        150,
        200
    );

    kitchen.setTexture(
        module,
        TextureType.WHITE
    );

    expect(module.getTexture()).toBe(texture);
});