import {OrthographicCamera, Scene} from "three";

export class Camera {
    private static readonly frustumSize: number = 350;
    readonly threeJsCamera: OrthographicCamera = new OrthographicCamera(0,0,0,0);
    constructor(private readonly scene:Scene) {
        scene.add(this.threeJsCamera);
        this.setFrustum();
        this.threeJsCamera.position.set(90, 450, 350);
        window.addEventListener( 'resize', () => this.setFrustum(), false );
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