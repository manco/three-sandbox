import { Kitchen } from "../model/kitchen/kitchen";
import { Scene } from "three";
import { Texture } from "three";
import ModulesLibrary from "../model/modules/modules-library";
import { ModuleTypesAll } from "../model/modules/types";
import { TexturesLibrary } from "../model/textures";
import { TextureType } from "../model/textures";
import { Meshes } from "./helpers/meshes";
import { Modules } from "./helpers/modules";
import { Dimensions } from "../model/kitchen/kitchen";
jest.mock("../model/modules/modules-library");
jest.mock("../model/textures");
test('kitchen creates floor, wall and wall modules', () => {
    //@ts-ignore
    ModulesLibrary.mockImplementation(() => {
        const mockModuleFun = (t) => Modules.module(t);
        return {
            ofType: mockModuleFun,
            createModule: mockModuleFun
        };
    });
    const scene = new Scene();
    new Kitchen(new ModulesLibrary(), new TexturesLibrary(), scene).initFloorAndWalls(new Dimensions(100, 150, 200), ["A"]);
    expect(scene.getObjectByName("Floor")).toBeDefined();
    expect(scene.getObjectByName("WallA")).toBeDefined();
    expect(scene.children.filter((m) => m.name === Meshes.DefaultMeshName)).toHaveLength(ModuleTypesAll.length * 2);
});
test('kitchen can change module texture', () => {
    const texture = new Texture();
    //@ts-ignore
    TexturesLibrary.mockImplementation(() => {
        return { get: () => texture };
    });
    const module = Modules.module();
    const kitchen = new Kitchen(null, new TexturesLibrary(), null);
    kitchen.setBackTexture(module, TextureType.WHITE);
    expect(module.getBackTexture()).toBe(texture);
});
