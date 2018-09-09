import {Camera} from "./camera";
import {Message} from "./utils/observable";
import {Vector3} from "three";
import {OrbitControls} from "./utils/OrbitControls";

export class Controls {
    private static RotateStep = Math.PI * 0.05;

    private readonly orbitControls: OrbitControls;
    constructor(camera: Camera, canvas:HTMLCanvasElement, target: Vector3) {
        this.orbitControls = new OrbitControls( camera.threeJsCamera, canvas );
        this.orbitControls.maxPolarAngle = Math.PI /2;
        this.orbitControls.target = target;
        this.orbitControls.update();
        camera.subscribe((msg:Message) => {
            if (msg.type == "CENTERED") {
                this.orbitControls.update();
            }
        });
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
}