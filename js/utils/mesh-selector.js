export class MeshSelector {
    constructor(camera, mouseTracker) {
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.mouseTracker = mouseTracker;
        this.selected = null;
        this.previousSelectedEmissiveColor = null;
    }
    selectMesh(meshes) {
        if (this.selected != null) {
            this.selected.material.emissive.setHex(this.previousSelectedEmissiveColor);
            this.selected = null;
        }
        this.raycaster.setFromCamera(this.mouseTracker.xy, this.camera);
        const intersectingMeshes = this.raycaster.intersectObjects(meshes).map(i => i.object);
        if (intersectingMeshes.length > 0) {
            const mesh = intersectingMeshes[0];
            this.previousSelectedEmissiveColor = mesh.material.emissive.getHex();
            this.selected = mesh;
            mesh.material.emissive.setHex(0x00ff00);
        }
    }
}