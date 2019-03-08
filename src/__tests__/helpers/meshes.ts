import {Mesh} from "three";
import {PlaneBufferGeometry} from "three";
import {BoxGeometry} from "three";
import {BoxBufferGeometry} from "three";

export class Meshes {
    static DefaultMeshName = "someMesh";
    static mesh(name: string = Meshes.DefaultMeshName): Mesh {
        const m = new Mesh(new BoxBufferGeometry( 500, 400, 300 ) );
        m.geometry.computeBoundingBox();
        m.name = name;
        return m;
    };
}