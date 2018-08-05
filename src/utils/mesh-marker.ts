import {Color, Mesh} from "three";

export class MeshMarker {
    public mark: (mesh: Mesh) => Color;
    constructor(color) {
        this.mark = (mesh: any) => mesh.material.emissive.setHex(color);
    }
}