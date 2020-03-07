import {Mesh} from "three";
import {LineBasicMaterial} from "three";
import {EdgesGeometry} from "three";
import {LineSegments} from "three";
import {LineDashedMaterial} from "three";

export class Meshes {
    static meshWidthX(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.x - bbox.min.x;
    }

    static meshDepthY(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.y - bbox.min.y;
    }

    static meshHeightZ(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.z - bbox.min.z;
    }

    static hasFront(mesh: Mesh) {
        return Array.isArray(mesh.material);
    }

    static hideWireframe(mesh: Mesh) {
        mesh.dispatchEvent({type:"HIDE_WIREFRAME"});
    }

    static showWireframe(mesh: Mesh, dashed: boolean) {
        const material = dashed ?
            new LineDashedMaterial({color: 0x000000, dashSize: 2, gapSize: 2, linewidth: 200}) :
            new LineBasicMaterial({color: 0x000000});
        mesh.add(this.edgesHelper(material)(mesh));
    }

    private static edgesHelper(material:LineBasicMaterial) {
        return (mesh: Mesh) => {
            const geometry = new EdgesGeometry(mesh.geometry);
            const line = new LineSegments(geometry, material);
            line.computeLineDistances();
            mesh.addEventListener("HIDE_WIREFRAME", _ => {
                mesh.remove(line);
                geometry.dispose();
                material.dispose();
            });
            return line;
        }
    }
}

export interface MutateMeshFun {
    (mesh:Mesh):void
}

