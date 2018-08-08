import {OrthographicCamera, Scene} from "three";

export class Camera {
    private static frustumSize: number = 500;
    readonly threeJsCamera: OrthographicCamera = new OrthographicCamera(0,0,0,0);
    constructor(private readonly scene:Scene) {
        scene.add(this.threeJsCamera);

        const setFrustum = ():void => {
            const aspect = window.innerWidth / window.innerHeight;
            this.threeJsCamera.left = -Camera.frustumSize * aspect / 2;
            this.threeJsCamera.right = Camera.frustumSize * aspect / 2;
            this.threeJsCamera.top = Camera.frustumSize / 2;
            this.threeJsCamera.bottom = -Camera.frustumSize / 2;
            this.threeJsCamera.near = -1000;
            this.threeJsCamera.updateProjectionMatrix();
        };
        setFrustum();

        this.centerCamera();
        window.addEventListener( 'resize', setFrustum, false );
    }

    centerCamera(): void {
        this.threeJsCamera.position.set(90, 150, 250);
    }

    lookAtScene(): void {
        this.threeJsCamera.lookAt(this.scene.position);
    }
}