import {ModulesLibrary, ModuleTypes} from './modules.js'
import {Wall, Floor, Kitchen} from './kitchen.js'
/*
    TODO

    1. move codebase to typescript
    * 2. split codebase into multiple files
    3. think of IoC regarding building scene

    * 4. kitchen should have field slotWidth
    6. Floor / MeshGrid / Wall better class design
    8. unit tests. It's time for unit tests

    9. load models from somewhere else

    (...)

    O try to display outlines of obj's
    * panel klienta (podawanie wymiarów)
    * wypełnienie całej ściany na podstawie wymiarów
    O Lista szafek z boku
    O podawanie koloru korpusów (brył)
    O ROZPOZNANIE: nakładanie tekstur, jak to się robi i czy łatwiej mieć osobną bryłę?
    O ROZPOZNANIE: raytracing z kursora do szafki (zaznaczanie aktywnej szafki)
    O Przycisk 'zamów' i wysłanie emaila <--- jak to zabezpieczyć?
    *
 */

const light = createLight();
function createLight() {
    const light = new THREE.DirectionalLight( 0xffffff, 0.7 );
    light.name = 'DirLight';
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
    cam.near = -1000;
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
    s.background = new THREE.Color(0xa9a9a9);
    return s;
}

const modulesLibrary = new ModulesLibrary();
const kitchen = new Kitchen(modulesLibrary, scene);
window.kitchen = kitchen;

init();
animate();

function init() {

    function loadKitchen() {
        kitchen.removeAll();
        initWalls();
        initModules();
    }
    document.getElementById("drawKitchenButton").addEventListener('click', loadKitchen);

    modulesLibrary.loadPrototypes([
        { url: 'models/szafka_dol.obj', type: ModuleTypes.STANDING },
        { url: 'models/blat.obj', type: ModuleTypes.TABLETOP },
        { url: 'models/szafka_gora.obj', type: ModuleTypes.HANGING }
    ]);

    window.scene = scene; //for three.js inspector
    scene.add(camera);
    scene.add(light);
    new Floor().addTo(scene);

    document.getElementById("WebGL-output").appendChild( renderer.domElement );

    function onWindowResize() {
        setFrustum(camera);
        renderer.setSize( window.innerWidth, window.innerHeight );
    }
	window.addEventListener( 'resize', onWindowResize, false );
}

function initWalls() {

    const axisY = new THREE.Vector3(0, 1, 0);
    const x0 = 0;

    const [ width, depth, height ] = [
        x0 + document.getElementById("kitchen-width").value,
        document.getElementById("kitchen-depth").value,
        document.getElementById("kitchen-height").value
    ];


    const wallA = new Wall("A", width, height);

    const wallB = new Wall("B", depth, height,
        m => {
            m.translateX(width/2);
            m.translateZ(depth/2);
        },
        m => m.rotateOnWorldAxis(axisY, - Math.PI / 2)
    );

    const wallC = new Wall("C", width, height,
        m => m.translateZ(depth),
        m => m.rotateZ(Math.PI)
    );

    const wallD = new Wall("D", depth, height,
        m => {
            m.translateX(-width/2);
            m.translateZ(depth/2);
        },
        m => m.rotateOnWorldAxis(axisY, Math.PI / 2)
    );
    [
        wallA,
        wallB,
        wallC,
        wallD
    ].forEach(wall => kitchen.addWall(wall) );
}

function initModules() {
    const chosenWalls = Array.from(document.getElementsByClassName("gui-checkbox"))
        .filter(c => c.checked)
        .map(w => kitchen.findWallByName(w.value));

    chosenWalls.forEach(wall => kitchen.fillWallWithModules(wall))
}

function animate() {
	requestAnimationFrame( animate );
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}