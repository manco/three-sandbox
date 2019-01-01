import {Camera} from "./camera";
import {Vector3} from "three";
import {OrbitControls} from "../utils/OrbitControls";

export class Controls {
    private static readonly RotateStep = Math.PI * 0.05;
    private static readonly PanStep = 50;

    private readonly orbitControls: OrbitControls;
    constructor(camera: Camera, canvas: HTMLCanvasElement, target: Vector3) {
        this.orbitControls = new OrbitControls( camera.threeJsCamera, canvas );
        this.orbitControls.maxPolarAngle = Math.PI /2;
        this.orbitControls.target = target;
        this.orbitControls.update();
        this.orbitControls.saveState();
    }

    zoomIn(): void {
        this.zoomChange(0.1);
    }

    zoomOut(): void {
        this.zoomChange(-0.1);
    }

    private zoomChange(delta: number) {
        const newZoom = this.orbitControls.threeJsCamera.zoom + delta;
        this.threeJsCamera.zoom = Math.min(10, Math.max(0, newZoom));
        this.threeJsCamera.updateProjectionMatrix();
    }

    panLeft() {
        this.panHorizontally(Controls.PanStep);
    }

    panRight() {
        this.panHorizontally(-Controls.PanStep);
    }

    private panHorizontally(deltaX: number) {
        this.orbitControls.pan(deltaX, 0);
        this.orbitControls.update();
    }

    rotateLeft() :void {
        this.rotateHorizontally(Controls.RotateStep);
    }

    rotateRight() :void {
        this.rotateHorizontally(-Controls.RotateStep);
    }

    private rotateHorizontally(angle: number) {
        this.orbitControls.rotateLeft(angle);
        this.orbitControls.update();
    }

    rotateUp() :void {
        this.rotateVertically(Controls.RotateStep);
    }

    rotateDown() :void {
        this.rotateVertically(-Controls.RotateStep);
    }

    private rotateVertically(angle: number) {
        this.orbitControls.rotateUp(angle);
        this.orbitControls.update();
    }

    reset() {
        this.orbitControls.reset();
    }
}