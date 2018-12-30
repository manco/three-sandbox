import {Mesh} from "three";

export class Meshes {
    static meshWidthX(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.x - bbox.min.x;
    }

    static meshDepthY(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.y - bbox.min.y;
    }
}

export interface MutateMeshFun {
    (mesh:Mesh):void
}

