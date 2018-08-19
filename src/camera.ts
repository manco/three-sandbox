import {OrthographicCamera, Scene} from "three";
import {Message, Observable} from "./utils/observable";

export class Camera extends Observable {
    private static readonly frustumSize: number = 500;
    readonly threeJsCamera: OrthographicCamera = new OrthographicCamera(0,0,0,0);
    constructor(private readonly scene:Scene) {
        super();
        scene.add(this.threeJsCamera);
        this.setFrustum();
        this.centerCamera();
        window.addEventListener( 'resize', () => this.setFrustum(), false );
    }

    centerCamera(): void {
        this.threeJsCamera.position.set(90, 150, 250);
        this.notify(new Message("CENTERED"));
    }

    private setFrustum():void {
        const aspect = window.innerWidth / window.innerHeight;
        this.threeJsCamera.left = -Camera.frustumSize * aspect / 2;
        this.threeJsCamera.right = Camera.frustumSize * aspect / 2;
        this.threeJsCamera.top = Camera.frustumSize / 2;
        this.threeJsCamera.bottom = -Camera.frustumSize / 2;
        this.threeJsCamera.near = -1000;
        this.threeJsCamera.updateProjectionMatrix();
    };
}