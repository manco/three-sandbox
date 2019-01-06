import {Camera} from "three";
import {Scene} from "three";
import {Renderer} from "./renderer";

export class RendererFactory {
    constructor(
        private readonly scene:Scene,
        private readonly camera:Camera
    ) {}
    public create(canvasWidth:number, canvasHeight:number) {
        return new Renderer(this.scene, this.camera, canvasWidth, canvasHeight);
    }
}