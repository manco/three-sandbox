import {Mesh} from "three";
import {BoxBufferGeometry} from "three";

export class Meshes {
    static DefaultMeshName = "someMesh";
    static box(name = Meshes.DefaultMeshName, width = 100, height = 300, depth = 200): Mesh {
        const m = new Mesh(new BoxBufferGeometry( width, height, depth ) );
        m.geometry.computeBoundingBox();
        m.name = name;
        return m;
    };
}