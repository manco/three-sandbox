import {Mesh, MeshLambertMaterial} from "three";

export class MeshMarker {
    constructor(private readonly color:number) {}
    mark(mesh:Mesh):void {
        (mesh.material as MeshLambertMaterial).emissive.setHex(this.color);
    }
}