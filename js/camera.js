const frustumSize = 500;
export class Camera {
    constructor(scene) {
        const cam = new THREE.OrthographicCamera();
        scene.add(cam);

        function setFrustum() {
            const aspect = window.innerWidth / window.innerHeight;
            cam.left = -frustumSize * aspect / 2;
            cam.right = frustumSize * aspect / 2;
            cam.top = frustumSize / 2;
            cam.bottom = -frustumSize / 2;
            cam.near = -1000;
            cam.updateProjectionMatrix();
        }
        setFrustum();

        function centerCamera() {
            cam.position.set(90, 150, 250);
        }
        centerCamera();

        this.centerCamera = centerCamera;
        this.lookAtScene = () => cam.lookAt(scene.position);
        window.addEventListener( 'resize', setFrustum, false );
        this.threeJsCamera = cam;
    }
}