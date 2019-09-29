import {wallsFactories} from "../model/kitchen/kitchen";

import {Settler} from "../model/kitchen/Settler";
import {Corner} from "../model/kitchen/Settler";
import {Maps} from "../utils/lang";
import {Direction} from "../model/kitchen/Settler";

test('settler should identify two corners with fill directions and count modules that fit', () => {

     const givenNames = ["A", "B", "D"];
     const walls =
          Maps.mapValues(
              Maps.filterKeys(
                  wallsFactories(480, 200, 260),
          k => givenNames.includes(k)
              ),
              f => f()
          );

     const result = new Settler(60, 70).settle(new Map(walls));

     expect(result.corners).toContainEqual(new Corner("A", "B"));
     expect(result.corners).toContainEqual(new Corner("D", "A"));

     expect(result.modulesCount.get("A")).toBe(5);
     expect(result.modulesCount.get("B")).toBe(2);
     expect(result.modulesCount.get("D")).toBe(2);

     expect(result.fillDirection.get("A")).toEqual(Direction.TO_LEFT);
     expect(result.fillDirection.get("B")).toEqual(Direction.TO_RIGHT);
     expect(result.fillDirection.get("D")).toEqual(Direction.TO_LEFT);

     expect(result.modulesOffsetForIndex.get("A")(1)).toEqual(-70);
     expect(result.modulesOffsetForIndex.get("B")(1)).toEqual(70);
     expect(result.modulesOffsetForIndex.get("D")(1)).toEqual(-70);
});