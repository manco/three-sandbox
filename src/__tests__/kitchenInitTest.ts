import {Kitchen} from "../model/kitchen/kitchen";
import {Dimensions3D} from "../model/kitchen/kitchen";
import {Scene} from "three";
import ModulesFactory from "../model/modules/modules-factory";
import {ModuleTypesAll} from "../model/modules/types";
import {Meshes} from "./helpers/meshes";
import {Meshes as M} from "../utils/meshes";
import {MeshFactory} from "../utils/meshes-factory";
import ObstacleFactory from "../model/kitchen/obstacle-factory";

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
const obstacleFactory = new ObstacleFactory(new MeshFactory());

test('kitchen creates floor, wall and wall modules', () => {

    const scene = new Scene();
    new Kitchen(
        obstacleFactory,
        modulesFactory,
        null,
        null,
        scene
    ).initFloorAndWalls(new Dimensions3D(slotWidth * 4, 1000, 1000), ["A"], []);

    const modules = scene.children.filter((m) => m.name === Meshes.DefaultMeshName);
    expect(modules).toHaveLength(ModuleTypesAll.length * 4);

    expect(scene.getObjectByName("Floor")).toBeDefined();
    expect(scene.getObjectByName("WallA")).toBeDefined();
});

test('kitchen can remove everything from scene and indexes', () => {

    const scene = new Scene();
    const kitchen = new Kitchen(
        obstacleFactory,
        modulesFactory,
        null,
        null,
        scene
    );

    kitchen.initFloorAndWalls(new Dimensions3D(slotWidth * 4, 1000, 1000), ["A"], []);
    kitchen.removeAll();

    expect(scene.children).toHaveLength(0);
    expect(kitchen.modules.all()).toHaveLength(0);
});