import {MeshMarker} from "./mesh-marker";
import {Camera, Color, Intersection, Mesh, MeshLambertMaterial, Object3D, Raycaster} from "three";
import {MouseTracker} from "./mouseTracker";

export class MeshSelector {
    private readonly raycaster: Raycaster = new Raycaster();
    private readonly marker: MeshMarker = new MeshMarker(0x00ff00);
    private selected:Mesh = null;
    private previousSelectedEmissiveColor:number = null;
    constructor(private readonly camera:Camera, private readonly mouseTracker:MouseTracker) {}
    selectMeshByRaycast(meshes:Mesh[]):Mesh {
        return this.select(() => {
            const intersectingMeshes = this.castRay(meshes);
            if (intersectingMeshes.length > 0) {
                return intersectingMeshes[0] as Mesh;
            }
            return null;
        });
    }

    private castRay(meshes:Mesh[]): Object3D[] {
        this.raycaster.setFromCamera(this.mouseTracker.xy(), this.camera);
        return this.raycaster.intersectObjects(meshes).map((i:Intersection) => i.object);
    };

    selectMeshById(id:string, meshes:Mesh[]):Mesh {
        return this.select( () => meshes.find((m:Mesh) => m.uuid === id) );
    }

    private select(meshFun: () => Mesh):Mesh {
        if (this.selected !== null) {
            MeshSelector.emissive(this.selected).setHex(this.previousSelectedEmissiveColor);
            this.selected = null;
        }
        let mesh = meshFun();
        mesh = mesh === undefined ? null : mesh;

        if (mesh !== null) {
            this.previousSelectedEmissiveColor = MeshSelector.emissive(mesh).getHex();
            this.selected = mesh;
            this.marker.mark(mesh);
        }
        return mesh;
    }

    private static emissive(mesh:Mesh): Color {
        return (mesh.material as MeshLambertMaterial).emissive;
    }
}