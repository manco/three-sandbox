import {OrthographicCamera} from "three";
import {Controls} from "./controls";

export class ControlsFactory {
    constructor(
        private readonly camera: OrthographicCamera
    ) {}
    public create(canvas: HTMLCanvasElement) {
        return new Controls(this.camera, canvas);
    }
}