import {WallFactories} from "../model/kitchen/kitchen";

import {Settler} from "../model/kitchen/Settler";
import {Corner} from "../model/kitchen/Settler";
import {Maps} from "../utils/lang";
import {Direction} from "../model/kitchen/Settler";

test('settler should identify two corners with fill directions and count modules that fit', () => {

     const givenNames = ["A", "B", "D"];
     const walls =
          Maps.mapValues(
              Maps.filterKeys(
                  WallFactories(480, 200, 260),
          k => givenNames.includes(k)
              ),
              f => f()
          );

     const result = new Settler(60, 70).settle(new Map(walls));

     expect(result.corners).toContainEqual(new Corner("A", "B"));
     expect(result.corners).toContainEqual(new Corner("D", "A"));

     expect(result.forWalls.get("A").modulesCount).toBe(5);
     expect(result.forWalls.get("B").modulesCount).toBe(2);
     expect(result.forWalls.get("D").modulesCount).toBe(2);

     expect(result.forWalls.get("A").fillDirection).toEqual(Direction.TO_LEFT);
     expect(result.forWalls.get("B").fillDirection).toEqual(Direction.TO_RIGHT);
     expect(result.forWalls.get("D").fillDirection).toEqual(Direction.TO_LEFT);

     expect(result.forWalls.get("A").modulesOffsetForIndex(1)).toEqual(-70);
     expect(result.forWalls.get("B").modulesOffsetForIndex(1)).toEqual(70);
     expect(result.forWalls.get("D").modulesOffsetForIndex(1)).toEqual(-70);
});