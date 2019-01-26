import '../../node_modules/three/examples/js/loaders/OBJLoader';
import {Mesh, Object3D} from "three";
import {Group} from "three";
import {Lang} from "./lang";

export class PromisingLoader {
    // @ts-ignore
    private readonly loader = new THREE.OBJLoader();
    loadSingleMesh(url:string) {
        return new Promise<Object3D>(
            (resolve) => this.loader.load(url, resolve, Lang.noop, Lang.noop)
        ).then((obj:Group) => {
            if (obj.children.length > 1) {
                console.warn(`loadSingleMesh: ${url} resolved to group of meshes: ${obj.children}`)
            }
            return obj.children[0] as Mesh
        });
    }
}