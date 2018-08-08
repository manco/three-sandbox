import {BasicShadowMap, Scene, WebGLRenderer} from "three";
import {Camera} from "./camera";

export class Renderer {

    private readonly renderer: WebGLRenderer = new WebGLRenderer({
        antialias: true,
        devicePixelRatio: window.devicePixelRatio
    });

    constructor(private readonly scene:Scene, private readonly camera:Camera) {
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = BasicShadowMap;

        const resize = ():void => {
            this.renderer.setSize( window.innerWidth, window.innerHeight );
        };
        resize();

        window.addEventListener( 'resize', resize, false );

    }

    render(): void { return this.renderer.render(this.scene, this.camera.threeJsCamera) }
    canvas(): HTMLCanvasElement { return this.renderer.domElement; }
}