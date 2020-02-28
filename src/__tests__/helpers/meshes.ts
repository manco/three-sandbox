import {Mesh} from "three";
import {BoxBufferGeometry} from "three";

export class Meshes {
    static DefaultMeshName = "someMesh";
    static DefaultCornerName = "someCornerMesh";
    static box(name = Meshes.DefaultMeshName, width = 60, height = 300, depth = 60): Mesh {
        const g = new BoxBufferGeometry( width, height, depth , 2, 2, 2);
        g.computeBoundingBox();
        const m = new Mesh(g);
        m.name = name;
        return m;
    };
    static corner(name = Meshes.DefaultCornerName, width = 70, height = 300, depth = 70): Mesh {
        return Meshes.box(name, width, height, depth);
    }
}