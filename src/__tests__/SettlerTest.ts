import {wallsFactories} from "../model/kitchen/kitchen";

import {settle} from "../model/kitchen/Settler";
import {Corner} from "../model/kitchen/Settler";
import {Maps} from "../utils/lang";
test('settler should identify two corners and count modules that fit', () => {

     const givenNames = ["A", "B", "D"];
     const walls =
          Maps.mapValues(
              Maps.filterKeys(wallsFactories(480, 200, 260), k => givenNames.includes(k)),
              f => f()
          );

     const result = settle(new Map(walls));

     expect(result.corners).toContainEqual(new Corner("A", "B"));
     expect(result.corners).toContainEqual(new Corner("D", "A"));

     expect(result.modulesCount.get("A")).toBe(5);
     expect(result.modulesCount.get("B")).toBe(2);
     expect(result.modulesCount.get("D")).toBe(2);
});