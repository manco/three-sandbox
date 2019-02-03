import '../../node_modules/three/examples/js/loaders/OBJLoader';
import {Mesh} from "three";
import {Group} from "three";

export class PromisingLoader {
    // @ts-ignore
    private readonly loader = new THREE.OBJLoader();
    loadSingleMesh(url:string) {
        return new Promise<Group>(
            (resolve) => this.loader.load(url, resolve)
        ).then((obj:Group) => {
            if (obj.children.length > 1) {
                console.warn(`loadSingleMesh: ${url} resolved to group of meshes: ${obj.children}`)
            }
            return obj.children[0] as Mesh
        });
    }
}