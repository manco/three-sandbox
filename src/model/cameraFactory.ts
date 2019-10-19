import {OrthographicCamera, Scene} from "three";
import {Vector3} from "three";

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
        threeJsCamera.position.copy(this.InitPosition);
        window.addEventListener( 'resize', setFrustum, false );
        threeJsCamera.up.set(0,0,1);
        return threeJsCamera;
    }

    public static readonly InitPosition : Vector3 = new Vector3(90, -350, 450);
}