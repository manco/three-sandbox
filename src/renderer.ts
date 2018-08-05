import {BasicShadowMap, WebGLRenderer} from "three";

export class Renderer {
    public canvas: () => HTMLCanvasElement;
    public render: () => void;
    constructor(scene, camera) {
        const renderer = new WebGLRenderer({ antialias: true });
        function resize() {
            renderer.setSize( window.innerWidth, window.innerHeight );
        }
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = BasicShadowMap;
        renderer.setPixelRatio( window.devicePixelRatio );
        resize();

        window.addEventListener( 'resize', resize, false );

        this.canvas = () => renderer.domElement;
        this.render = () => renderer.render(scene, camera.threeJsCamera);
    }
}