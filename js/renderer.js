export class Renderer {
    constructor(scene, camera) {
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        function resize() {
            renderer.setSize( window.innerWidth, window.innerHeight );
        }
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        renderer.setPixelRatio( window.devicePixelRatio );
        resize();

        window.addEventListener( 'resize', resize, false );

        this.canvas = () => renderer.domElement;
        this.render = () => renderer.render(scene, camera.threeJsCamera);
    }
}