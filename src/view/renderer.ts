import {BasicShadowMap, Scene, WebGLRenderer} from "three";
import {Camera} from "three";

export class Renderer {

    private readonly renderer: WebGLRenderer = new WebGLRenderer({
        antialias: true,
        devicePixelRatio: window.devicePixelRatio
    });

    constructor(private readonly scene:Scene, private readonly camera:Camera, canvasWidth:number, canvasHeight:number) {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = BasicShadowMap;

        const resize = ():void => {
            this.renderer.setSize(canvasWidth, canvasHeight);
        };
        resize();

        window.addEventListener( 'resize', () => resize(), false );

    }

    render(): void { return this.renderer.render(this.scene, this.camera) }
    canvas(): HTMLCanvasElement { return this.renderer.domElement; }
}