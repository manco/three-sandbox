class PromisingLoader {
    constructor() {
        this.onProgress = (xhr) => { };
        this.onError = (xhr) => { };
        this.loader = new THREE.OBJLoader();
    }
    loadSingleMesh(url) {
        return new Promise(
            (resolve) => this.loader.load(url, resolve, this.onProgress, this.onError)
        ).then(obj => {
            if (obj.children.length > 1) {
                console.warn("loadSingleMesh: ${url} resolved to group of meshes: ${obj.children}")
            }
            return obj.children[0]
        });
    }
}

const light = createLight();
function createLight() {
    const light = new THREE.DirectionalLight( 0xffffff, 0.7 );
    light.name = 'Dir. Light';
    light.position.set( 100, 300, 100 );
    light.castShadow = true;
    light.shadow.camera.near = 1;
    light.shadow.camera.far = 500;
    light.shadow.camera.right = 150;
    light.shadow.camera.left = - 150;
    light.shadow.camera.top	= 150;
    light.shadow.camera.bottom = - 150;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    return light;
}
const frustumSize = 500;
function setFrustum(cam) {
    const aspect = window.innerWidth / window.innerHeight;
    cam.left = -frustumSize * aspect / 2;
    cam.right = frustumSize * aspect / 2;
    cam.top = frustumSize / 2;
    cam.bottom = -frustumSize / 2;
    cam.updateProjectionMatrix();
}
const camera = createCamera();
function createCamera() {
    const c = new THREE.OrthographicCamera();
    c.position.z = 250;
    c.position.x = 90;
    c.position.y = 150;
    setFrustum(c);
    return c;
}
const renderer = createRenderer();
function createRenderer() {
    const r = new THREE.WebGLRenderer({ antialias: true });
    r.setPixelRatio( window.devicePixelRatio );
    r.setSize( window.innerWidth, window.innerHeight );
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.BasicShadowMap;
    return r;
}
const controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.target.set( 0, 2, 0 );
controls.update();

const scene = createScene();
function createScene() {
    const s = new THREE.Scene();
    s.add( new THREE.AmbientLight(0xcccccc, 0.4) );
    return s;
}
const ground = createGround();
function createGround() {
    const material = new THREE.MeshPhongMaterial( {
        color: 0xa0adaf,
        shininess: 50,
        specular: 0x111111
    } );
    const g = new THREE.Mesh(
        new THREE.BoxGeometry( 10, 0.15, 10 ), material );
    g.scale.multiplyScalar( 100 );
    g.receiveShadow = true;
    return g;
}

init();
animate();

function init() {
	const container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene.add(camera);
	scene.add(ground);
	scene.add(light);

    const modelsF = loadModels();
    modelsF.then(
        models => {
            models.forEach(m => {
                scene.add(m);
                m.castShadow = true; m.receiveShadow = true;
            }
            );
        });

	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}

function loadModels() {
    const loader = new PromisingLoader();
    const m1 =
        loader.loadSingleMesh('models/modul_01.obj')
        .then((obj) => { obj.position.set(60, 60, 60); return obj; })
    ;
    const m2 =
        loader.loadSingleMesh('models/modul_02.obj')
        .then((obj) => { obj.position.set(70, 80 ,70); return obj; })
    ;
    const m3 =
        loader.loadSingleMesh('models/modul_03.obj')
        .then((obj) => { obj.position.set(80, 80, 80); return obj; })
    ;

    return Promise.all([m1, m2, m3]);
}
function onWindowResize() {
    setFrustum(camera);
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	camera.lookAt( scene.position );
	renderer.render( scene, camera );
}