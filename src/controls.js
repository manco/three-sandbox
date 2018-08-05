import 'three/OrbitControls';
export class ControlsInitialzer {
    static initControls(camera, renderer) {
        const controls = new THREE.OrbitControls( camera.threeJsCamera, renderer.canvas() );
        controls.target.set( 0, 2, 0 );
        controls.update();
    }
}