import {Mesh} from "three";
import {PlaneBufferGeometry} from "three";

export class Meshes {
    static DefaultMeshName = "someMesh";
    static mesh(name: string = Meshes.DefaultMeshName): Mesh {
        const m = new Mesh(new PlaneBufferGeometry( 50, 30 ) );
        m.name = name;
        return m;
    };
}