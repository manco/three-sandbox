export class MeshMarker {
    constructor(color) {
        this.mark = (mesh) => mesh.material.emissive.setHex(color);
    }
}