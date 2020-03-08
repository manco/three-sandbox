import {Corner, Direction, Settler} from "../model/kitchen/Settler";
import {ModuleType} from "../model/modules/types";
import {WallFactories} from "../model/kitchen/kitchen";
import {Maps} from "../utils/lang";
import ModulesFactory from "../model/modules/modules-factory";
import {Meshes} from "./helpers/meshes";
import {MeshFactory} from "../utils/meshes-factory";
import {ResizeReason} from "../model/modules/resizing";
import {Obstacle, ObstacleType} from "../model/kitchen/obstacle";

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

test('settler should settle modules on space skipping obstacle', () => {

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
        [Obstacle.of(90, 260, "B", 200, ObstacleType.DOOR)]
    );


    //then
    //expect(puts.map(put => put.offset)).toEqual([70, 130, 190, 250]); TODO rethink proper offsets
});

test('settler should compute bounds for right settlement', () => {

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
    const abda = [new Corner("A", "B"), new Corner("D", "A")];
    const door = [Obstacle.of(100, 200, "A", 200, ObstacleType.DOOR)];

    const boundsWhenRight = settler.computeBounds(
        ModuleType.STANDING,
        walls.get("A"),
        abda,
        door,
        Direction.TO_RIGHT
    );

    const boundsWhenLeft = settler.computeBounds(
        ModuleType.STANDING,
        walls.get("A"),
        abda,
        door,
        Direction.TO_LEFT
    );


    //then
    expect(boundsWhenRight).toContainEqual({to:70, from:0});
    expect(boundsWhenRight).toContainEqual({to:420, from:350});
    expect(boundsWhenRight).toContainEqual({to:250, from:150});

    expect(boundsWhenLeft).toContainEqual({to:70, from:0});
    expect(boundsWhenLeft).toContainEqual({to:420, from:350});
    expect(boundsWhenLeft).toContainEqual({to:270, from:170});
});