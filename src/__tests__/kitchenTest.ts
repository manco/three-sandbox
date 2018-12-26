import {Kitchen} from "../model/kitchen/kitchen";
import {Scene} from "three";

const dummy = null;

test('kitchen creates floor', () => {

    const scene = new Scene();

    new Kitchen(
        dummy,
        scene,
        100,
        150,
        200
    );

    expect(scene.getObjectByName("Floor")).toBeDefined();
});