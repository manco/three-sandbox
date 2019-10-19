import {Mesh} from "three";
import {BoxBufferGeometry} from "three";

export class Meshes {
    static DefaultMeshName = "someMesh";
    static box(name = Meshes.DefaultMeshName, width = 100, height = 300, depth = 200): Mesh {
        const g = new BoxBufferGeometry( width, height, depth , 2, 2, 2);
        const m = new Mesh(g);
        g.computeBoundingBox();
        m.name = name;
        return m;
    };
}