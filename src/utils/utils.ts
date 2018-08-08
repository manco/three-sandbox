import {Mesh} from "three";

export class Utils {
    static meshWidthX(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.x - bbox.min.x;
    }

    static  meshDepthY(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.y - bbox.min.y;
    }

    static flatten<T>(arr:T[][]):T[] {
        return [].concat(...arr)
    }
}

export interface MutateMeshFun {
    (mesh:Mesh):void
}

