import {Color, Intersection, Mesh, MeshLambertMaterial, Object3D, Raycaster} from "three";
import {Camera} from "three";
import {Coords} from "./lang";

export class MeshSelector {
    private readonly raycaster: Raycaster = new Raycaster();
    private readonly SelectionColor: number = 0x00ff00;
    private selected:Mesh = null;
    private previousSelectedEmissiveColor:number = null;

    selectMeshByRaycast(camera: Camera, xy:Coords, meshes:Mesh[]):Mesh {
        return this.select(() => {
            const intersectingMeshes = this.castRay(camera, xy, meshes);
            if (intersectingMeshes.length > 0) {
                return intersectingMeshes[0] as Mesh;
            }
            return null;
        });
    }

    private castRay(camera: Camera, xy:Coords, meshes:Mesh[]): Object3D[] {
        this.raycaster.setFromCamera(xy, camera);
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
            MeshSelector.emissive(this.selected).setHex(this.SelectionColor);
        }
        return mesh;
    }

    private static emissive(mesh:Mesh): Color {
        return (mesh.material as MeshLambertMaterial).emissive;
    }
}