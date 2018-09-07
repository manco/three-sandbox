import 'three/OrbitControls';
import {Camera} from "./camera";
import {Renderer} from "./renderer";
import {OrbitControls, Vector3} from "three";
import {Message} from "./utils/observable";

export class Controls {
    private readonly orbitControls: OrbitControls;
    constructor(camera: Camera, renderer:Renderer, target: Vector3) {
        this.orbitControls = new OrbitControls( camera.threeJsCamera, renderer.canvas() );
        this.orbitControls.maxPolarAngle = Math.PI /2;
        this.orbitControls.enablePan = false;
        this.orbitControls.target = target;
        this.orbitControls.update();
        camera.subscribe((msg:Message) => {
            if (msg.type == "CENTERED") {
                this.orbitControls.update();
            }
        });
    }
}