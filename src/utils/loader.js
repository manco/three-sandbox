import 'three/OBJLoader';
const noop = (xhr) => {};
export class PromisingLoader {
    constructor() {
        this.loader = new THREE.OBJLoader();
    }
    loadSingleMesh(url) {
        return new Promise(
            (resolve) => this.loader.load(url, resolve, noop, noop)
        ).then(obj => {
            if (obj.children.length > 1) {
                console.warn(`loadSingleMesh: ${url} resolved to group of meshes: ${obj.children}`)
            }
            return obj.children[0]
        });
    }
}