import {Vector3} from "three";
import {OrthographicCamera} from "three";
import {OrbitControls} from "../utils/OrbitControls";

export class Controls {

    private readonly orbitControls: OrbitControls;
    constructor(private readonly camera: OrthographicCamera, canvas: HTMLCanvasElement) {
        this.orbitControls = new OrbitControls( camera, canvas );
    }

    setTarget(target: Vector3) {
        this.orbitControls.target = target;
        this.orbitControls.update();
        this.orbitControls.saveState();
    }

    setMouseMode(mode: MouseMode) {
        this.orbitControls.mouseMode = mode;
    }

    zoomIn(): void {
        this.zoomChange(0.1);
    }

    zoomOut(): void {
        this.zoomChange(-0.1);
    }

    private zoomChange(delta: number) {
        const newZoom = this.camera.zoom + delta;
        this.camera.zoom = Math.min(10, Math.max(0, newZoom));
        this.camera.updateProjectionMatrix();
    }

    reset() {
        this.orbitControls.reset();
    }
}

export enum MouseMode {
    PAN_ONLY, ROTATE_ONLY, NONE
}