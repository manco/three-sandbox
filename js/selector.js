export class ModuleSelector {
    constructor(camera) {
        this.camera = camera;
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2(0, 0); //TODO extract as MouseTracker class
        this.selected = null;
        this.previousSelectedEmissiveColor = null;
    }
    selectMesh() {
        if (this.selected != null) {
            this.selected.material.emissive.setHex(this.previousSelectedEmissiveColor);
        }
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersectingMeshes = this.raycaster.intersectObjects(kitchen.allModules().map(m => m.mesh)).map(i => i.object);
        const mesh = intersectingMeshes[0];
        this.previousSelectedEmissiveColor = mesh.material.emissive.getHex();
        mesh.material.emissive.setHex(0x00ff00);
        this.selected = mesh;
    }

    updateMouse(x, y) {
        this.mouse.x = x;
        this.mouse.y = y;
    }
}