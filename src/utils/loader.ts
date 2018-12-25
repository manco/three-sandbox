import '../../node_modules/three/examples/js/loaders/OBJLoader';
import {Mesh, Object3D} from "three";

const noop = (xhr) => {};
export class PromisingLoader {
    // @ts-ignore
    private readonly loader = new THREE.OBJLoader();
    loadSingleMesh(url) {
        return new Promise<Object3D>(
            (resolve) => this.loader.load(url, resolve, noop, noop)
        ).then((obj:Object3D) => {
            if (obj.children.length > 1) {
                console.warn(`loadSingleMesh: ${url} resolved to group of meshes: ${obj.children}`)
            }
            return obj.children[0] as Mesh
        });
    }
}