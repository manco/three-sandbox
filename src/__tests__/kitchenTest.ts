import {Kitchen} from "../model/kitchen/kitchen";
import {Scene} from "three";
import {Mesh} from "three";
import {PlaneBufferGeometry} from "three";
import ModulesLibrary from "../model/modules/modules-library";
import {ModuleType} from "../model/modules/types";
import {ModuleTypesAll} from "../model/modules/types";

jest.mock("../model/modules/modules-library");

test('kitchen creates floor, wall and wall modules', () => {

    //@ts-ignore
    ModulesLibrary.mockImplementation(() => {
        const createMeshFun = () => {
            const m = new Mesh(new PlaneBufferGeometry( 50, 30 ) );
            m.name = "modulemesh";
            return m;
        };
        const mockModuleFun = (t:ModuleType) =>
            Promise.resolve(
                {
                    width: 50,
                    type: t,
                    mesh: createMeshFun(),
                    initRotation: () => {}
                }
            );
        return {
            ofType: mockModuleFun,
            createModule: mockModuleFun
        };
    });

    const scene = new Scene();
    const initFinished = new Kitchen(
        new ModulesLibrary(),
        scene,
        100,
        150,
        200
    ).initFloorAndWalls(["A"]);

    return initFinished.then(() => {
        expect(scene.getObjectByName("Floor")).toBeDefined();
        expect(scene.getObjectByName("WallA")).toBeDefined();
        expect(scene.children.filter((m) => m.name === 'modulemesh'))
            .toHaveLength(ModuleTypesAll.length * 2);
    });
});