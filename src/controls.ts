import {Camera} from "./camera";
import {Vector3} from "three";
import {OrbitControls} from "./utils/OrbitControls";

export class Controls {
    private static RotateStep = Math.PI * 0.05;
    private static PanStep = 50;

    private readonly orbitControls: OrbitControls;
    constructor(camera: Camera, canvas: HTMLCanvasElement, target: Vector3) {
        this.orbitControls = new OrbitControls( camera.threeJsCamera, canvas );
        this.orbitControls.maxPolarAngle = Math.PI /2;
        this.orbitControls.target = target;
        this.orbitControls.update();
        this.orbitControls.saveState();
    }

    panLeft() {
        this.orbitControls.pan(Controls.PanStep, 0);
        this.orbitControls.update();
    }

    panRight() {
        this.orbitControls.pan(-Controls.PanStep, 0);
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