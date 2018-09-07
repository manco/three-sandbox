import {OrthographicCamera, Scene} from "three";
import {Message, Observable} from "./utils/observable";

export class Camera extends Observable {
    private static readonly frustumSize: number = 350;
    readonly threeJsCamera: OrthographicCamera = new OrthographicCamera(0,0,0,0);
    constructor(private readonly scene:Scene) {
        super();
        scene.add(this.threeJsCamera);
        this.setFrustum();
        this.centerCamera();
        window.addEventListener( 'resize', () => this.setFrustum(), false );
    }

    centerCamera(): void {
        this.threeJsCamera.position.set(90, 450, 350);
        this.threeJsCamera.zoom = 1;
        this.threeJsCamera.updateProjectionMatrix();
        this.notify(new Message("CENTERED"));
    }

    rotateLeft() :void {

    }
    rotateRight() :void {

    }
    rotateUp() :void {

    }
    rotateDown() :void {

    }

    zoomIn(): void {
        this.zoomChange(0.1);
    }

    zoomOut(): void {
        this.zoomChange(-0.1);
    }

    private zoomChange(delta: number) {
        const newZoom = this.threeJsCamera.zoom + delta;
        this.threeJsCamera.zoom = Math.min(10, Math.max(0, newZoom));
        this.threeJsCamera.updateProjectionMatrix();
    }

    private setFrustum():void {
        const aspect = window.innerWidth / window.innerHeight;
        this.threeJsCamera.left = -Camera.frustumSize * aspect;
        this.threeJsCamera.right = Camera.frustumSize * aspect;
        this.threeJsCamera.top = Camera.frustumSize;
        this.threeJsCamera.bottom = -Camera.frustumSize;
        this.threeJsCamera.near = -1000;
        this.threeJsCamera.updateProjectionMatrix();
    };
}