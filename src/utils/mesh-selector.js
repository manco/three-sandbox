import {MeshMarker} from "./mesh-marker.js";

export class MeshSelector {
    constructor(camera, mouseTracker) {
        const raycaster = new THREE.Raycaster();
        this._castRay = meshes => {
            raycaster.setFromCamera(mouseTracker.xy, camera);
            return raycaster.intersectObjects(meshes).map(i => i.object);
        };

        let selected = null;
        let previousSelectedEmissiveColor = null;
        const marker = new MeshMarker(0x00ff00);
        this._select = (meshFun) => {
            if (selected != null) {
                selected.material.emissive.setHex(previousSelectedEmissiveColor);
                selected = null;
            }
            const mesh = meshFun();
            if (mesh != null) {
                previousSelectedEmissiveColor = mesh.material.emissive.getHex();
                selected = mesh;
                marker.mark(mesh);
            }
            return mesh;
        }
    }
    selectMeshByRaycast(meshes) {
        return this._select(() => {
            const intersectingMeshes = this._castRay(meshes);
            if (intersectingMeshes.length > 0) {
                return intersectingMeshes[0];
            }
            return null;
        });
    }

    selectMeshById(id, meshes) {
        return this._select( () => meshes.find(m => m.uuid === id) );
    }
}