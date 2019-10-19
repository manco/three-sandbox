import {AmbientLight, Color, DirectionalLight, Scene} from "three";

export class SceneFactory {
    static create(): Scene {
        const light = new DirectionalLight( 0xffffff, 0.7 );
        light.name = 'DirLight';
        light.position.set( 100, -100, 300 );
        light.castShadow = true;
        light.shadow.camera.near = 1;
        light.shadow.camera.far = 500;
        light.shadow.camera.right = 150;
        light.shadow.camera.left = - 150;
        light.shadow.camera.top	= 150;
        light.shadow.camera.bottom = - 150;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;

        const scene = new Scene();
        scene.add( new AmbientLight(0xcccccc, 0.4) );
        scene.background = new Color(0xa0adaf);
        scene.add(light);
        return scene;
    }
}