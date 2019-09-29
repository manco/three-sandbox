import {Vector3} from "three";
import {OrthographicCamera} from "three";
import {OrbitControls} from "../utils/OrbitControls";
import {Observable} from "../utils/observable";
import {Message} from "../utils/observable";
import {Actions} from "./actions";
import {CameraFactory} from "../model/cameraFactory";

export class Controls extends Observable {

    private readonly Init2dPosition:Vector3 = new Vector3(0, 900, 0);

    private readonly orbitControls: OrbitControls;
    private is2d = false;
    private target0 = new Vector3(0,0,0);

    constructor(private readonly actions: Actions,
                private readonly camera: OrthographicCamera,
                canvas: HTMLCanvasElement) {
        super();
        this.orbitControls = new OrbitControls( camera, canvas );
    }

    switch2d3d():void {
        if (this.is2d) {
            this.actions.hideWireframe();
            this.camera.position.copy(CameraFactory.InitPosition);
            this.is2d = false;
        } else {
            this.actions.showWireframe();
            this.camera.position.copy(this.Init2dPosition);
            this.is2d = true;
        }
        this.setTarget(this.target0);
    }

    setTarget(target: Vector3) {
        this.target0.copy(target);
        this.orbitControls.target.copy(target);
        this.orbitControls.update();
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

    undo() {
        this.actions.undo();
    }
}

export enum MouseMode {
    PAN_ONLY, ROTATE_ONLY, NONE
}