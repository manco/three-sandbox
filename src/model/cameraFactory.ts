import {OrthographicCamera, Scene} from "three";

export class CameraFactory {
    public static create(scene:Scene): OrthographicCamera {
        const FrustumSize: number = 350;
        const threeJsCamera = new OrthographicCamera(0,0,0,0);
        const setFrustum = ():void => {
            const aspect = window.innerWidth / window.innerHeight;
            threeJsCamera.left = -FrustumSize * aspect;
            threeJsCamera.right = FrustumSize * aspect;
            threeJsCamera.top = FrustumSize;
            threeJsCamera.bottom = -FrustumSize;
            threeJsCamera.near = -1000;
            threeJsCamera.updateProjectionMatrix();
        };

        scene.add(threeJsCamera);
        setFrustum();
        threeJsCamera.position.set(90, 450, 350);
        window.addEventListener( 'resize', setFrustum, false );
        return threeJsCamera;
    }
}