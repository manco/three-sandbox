import 'three/OrbitControls';
import {Camera} from "./camera";
import {Renderer} from "./renderer";
import {OrbitControls, Vector3} from "three";
import {Message} from "./utils/observable";
export class ControlsInitializer {
    static initControls(camera: Camera, renderer:Renderer, target: Vector3): OrbitControls {
        // @ts-ignore
        const controls = new OrbitControls( camera.threeJsCamera, renderer.canvas() );
        controls.maxPolarAngle = Math.PI /2;
        controls.enablePan = false;
        controls.target = target;
        console.log(`target param = ${target.toArray()}, set to ${controls.target.toArray()}`);
        controls.update();
        camera.subscribe((msg:Message) => {
            if (msg.type == "CENTERED") {
                controls.update();
            }
        });
        return controls;
    }
}