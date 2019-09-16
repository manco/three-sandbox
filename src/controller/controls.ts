import {Vector3} from "three";
import {OrthographicCamera} from "three";
import {OrbitControls} from "../utils/OrbitControls";
import {Observable} from "../utils/observable";
import {Message} from "../utils/observable";
import {Actions} from "./actions";

export class Controls extends Observable {

    private readonly orbitControls: OrbitControls;
    constructor(private readonly actions: Actions,
                private readonly camera: OrthographicCamera,
                canvas: HTMLCanvasElement) {
        super();
        this.orbitControls = new OrbitControls( camera, canvas );
    }

    switch2d3d():void {
        //set 2d
        this.actions.showWireframe();
        this.camera.position.set (0, 900, 0);
        this.orbitControls.update();
    }

    setTarget(target: Vector3) {
        this.orbitControls.target = target;
        this.orbitControls.update();
        this.orbitControls.saveState();
    }

    toggleMouseMode(mode: MouseMode) {
        if (this.orbitControls.mouseMode !== MouseMode.NONE) {
            this.notify(new Message("UNSET", this.orbitControls.mouseMode));
        }
        if (this.orbitControls.mouseMode === mode) {
            this.orbitControls.mouseMode = MouseMode.NONE;
        } else {
            this.orbitControls.mouseMode = mode;
            this.notify(new Message("SET", mode));
        }
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