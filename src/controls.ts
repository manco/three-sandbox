import 'three/OrbitControls';
import {Camera} from "./camera";
import {Renderer} from "./renderer";
export class ControlsInitialzer {
    static initControls(camera: Camera, renderer:Renderer): void {
        // @ts-ignore
        const controls = new THREE.OrbitControls( camera.threeJsCamera, renderer.canvas() );
        controls.target.set( 0, 2, 0 );
        controls.update();
    }
}