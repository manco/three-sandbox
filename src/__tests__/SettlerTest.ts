import {Settler} from "../model/kitchen/Settler";
import {ModuleType} from "../model/modules/types";
import {WallFactories} from "../model/kitchen/kitchen";
import {Maps} from "../utils/lang";
import ModulesFactory from "../model/modules/modules-factory";
import {Meshes} from "./helpers/meshes";
import {Meshes as M} from "../utils/meshes";
import {MeshFactory} from "../utils/meshes-factory";
import {Corner} from "../model/kitchen/Settler";
import {Direction} from "../model/kitchen/Settler";
import {ResizeReason} from "../model/modules/resizing";

// test('settler should identify two corners with fill directions and count modules that fit', () => {

     // const givenNames = ["A", "B", "D"];
     // const walls =
     //      Maps.mapValues(
     //          Maps.filterKeys(
     //              WallFactories(480, 200, 260),
     //      k => givenNames.includes(k)
     //          ),
     //          f => f()
     //      );
     //
     // const result = new Settler(60, 70).settle(new Map(walls));
     //
     // expect(result.corners).toContainEqual(new Corner("A", "B"));
     // expect(result.corners).toContainEqual(new Corner("D", "A"));
     //
     // expect(result.forWalls.get("A").modulesCount).toBe(5);
     // expect(result.forWalls.get("B").modulesCount).toBe(2);
     // expect(result.forWalls.get("D").modulesCount).toBe(2);
     //
     // expect(result.forWalls.get("A").fillDirection).toEqual(Direction.TO_LEFT);
     // expect(result.forWalls.get("B").fillDirection).toEqual(Direction.TO_RIGHT);
     // expect(result.forWalls.get("D").fillDirection).toEqual(Direction.TO_LEFT);
     //
     // expect(result.forWalls.get("A").modulesOffsetForIndex(1)).toEqual(-70);
     // expect(result.forWalls.get("B").modulesOffsetForIndex(1)).toEqual(70);
     // expect(result.forWalls.get("D").modulesOffsetForIndex(1)).toEqual(-70);
// });

jest.mock("../model/colors");
jest.mock("../model/modules/module-functions");
jest.mock("../utils/meshes-factory");

//@ts-ignore
MeshFactory.mockImplementation(() => {
    return {
        loadPrototypes: () => Promise.resolve(),
        ofType: (type:string) => type.indexOf("corner")>=0? Meshes.corner() : Meshes.box(),
        create: (type:string) => type.indexOf("corner")>=0? Meshes.corner() : Meshes.box()
    };
});
// const slotWidth = M.meshWidthX(Meshes.box());
// const cornerWidth = M.meshWidthX(Meshes.corner());
const modulesFactory = new ModulesFactory(new MeshFactory());

/**
 *  CBSSSSC
 */
test('settler should settle blende for the wall bounded by two corners', () => {

    const givenNames = ["A", "B", "C", "D"];
    const walls =
         Maps.mapValues(
             Maps.filterKeys(
                 WallFactories(420, 330, 260),
         k => givenNames.includes(k)
             ),
             f => f()
         );

    const settler = new Settler(modulesFactory);

    //when
    const puts = settler.settleWall(
        ModuleType.STANDING,
        walls.get("A"),
        [new Corner("A", "B"), new Corner("D", "A")],
        []
    );


    //then
    expect(puts.map(put => put.offset)).toEqual([0, -70, -130, -190, -250, -310]);
    expect(puts.filter(put => put.module.isCorner())).toHaveLength(1);
    expect(puts.map(put => put.module.resize.reason)).toContainEqual(ResizeReason.BLENDE);
});

/**
 *  C
 *  S
 *  S
 *  S
 *  E
 */
test('settler should settle expansion for wall bounded by one corner from left', () => {

    const givenNames = ["A", "B", "C", "D"];
    const walls =
        Maps.mapValues(
            Maps.filterKeys(
                WallFactories(420, 330, 260),
                k => givenNames.includes(k)
            ),
            f => f()
        );

    const settler = new Settler(modulesFactory);

    //when
    const puts = settler.settleWall(
        ModuleType.STANDING,
        walls.get("B"),
        [new Corner("A", "B")],
        []
    );


    //then
    expect(puts.map(put => put.offset)).toEqual([70, 130, 190, 250]);
    expect(puts.map(put => put.module.resize.reason)).toContainEqual(ResizeReason.EXPANSION);
});


test('settler should compute bounds', () => {

    const givenNames = ["A", "B", "C", "D"];
    const walls =
        Maps.mapValues(
            Maps.filterKeys(
                WallFactories(420, 330, 260),
                k => givenNames.includes(k)
            ),
            f => f()
        );

    const settler = new Settler(modulesFactory);

    //when
    const bounds = settler.computeBounds(
        walls.get("A"),
        [new Corner("A", "B"), new Corner("D", "A")]
    );


    //then
    expect(bounds).toContainEqual({to:70, from:0});
    expect(bounds).toContainEqual({to:420, from:350});
});