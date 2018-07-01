export class MeshSelector {
    constructor(camera, mouseTracker) {
        const raycaster = new THREE.Raycaster();
        this._castRay = meshes => {
            raycaster.setFromCamera(mouseTracker.xy, camera);
            return raycaster.intersectObjects(meshes).map(i => i.object);
        };
        this.selected = null;
        this.previousSelectedEmissiveColor = null;
    }
    selectMesh(meshes) {
        if (this.selected != null) {
            this.selected.material.emissive.setHex(this.previousSelectedEmissiveColor);
            this.selected = null;
        }
        const intersectingMeshes = this._castRay(meshes);
        if (intersectingMeshes.length > 0) {
            const mesh = intersectingMeshes[0];
            this.previousSelectedEmissiveColor = mesh.material.emissive.getHex();
            this.selected = mesh;
            mesh.material.emissive.setHex(0x00ff00);
        }
    }
}