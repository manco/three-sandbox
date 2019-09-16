import {OrthographicCamera} from "three";
import {Controls} from "./controls";
import {Actions} from "./actions";

export class ControlsFactory {
    constructor(
        private readonly camera: OrthographicCamera,
        private readonly actions: Actions
    ) {}
    public create(canvas: HTMLCanvasElement) {
        return new Controls(this.actions, this.camera, canvas);
    }
}