export class ModuleSelector {
    constructor(camera, mouseTracker) {
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.mouseTracker = mouseTracker;
        this.selected = null;
        this.previousSelectedEmissiveColor = null;
    }
    selectMesh() {
        if (this.selected != null) {
            this.selected.material.emissive.setHex(this.previousSelectedEmissiveColor);
        }
        this.raycaster.setFromCamera(this.mouseTracker.xy, this.camera);
        const intersectingMeshes = this.raycaster.intersectObjects(kitchen.allModules().map(m => m.mesh)).map(i => i.object);
        const mesh = intersectingMeshes[0];
        this.previousSelectedEmissiveColor = mesh.material.emissive.getHex();
        mesh.material.emissive.setHex(0x00ff00);
        this.selected = mesh;
    }
}