import {ModulesLibrary, ModuleTypes} from './modules.js'
import {Wall, Floor, Kitchen} from './kitchen.js'
import {ModuleSelector} from "./module-selector.js";
import {MouseTracker} from "./utils/mouseTracker.js";
import {Renderer} from "./renderer.js";
import {Camera} from "./camera.js";

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

const scene = createScene();
function createScene() {
    const s = new THREE.Scene();
    s.add( new THREE.AmbientLight(0xcccccc, 0.4) );
    s.background = new THREE.Color(0xa0adaf);
    return s;
}

const camera = new Camera(scene);

const renderer = new Renderer(scene, camera);

const controls = new THREE.OrbitControls( camera.threeJsCamera, renderer.canvas() );
controls.target.set( 0, 2, 0 );
controls.update();

const modulesLibrary = new ModulesLibrary();
const kitchen = new Kitchen(modulesLibrary, scene);
window.kitchen = kitchen;

const mouseTracker = new MouseTracker(renderer.canvas());

const moduleSelector = new ModuleSelector(camera, kitchen, mouseTracker);

init();
animate();

function init() {

    function loadKitchen() {

        const [ width, depth, height ] = [
            document.getElementById("kitchen-width").value,
            document.getElementById("kitchen-depth").value,
            document.getElementById("kitchen-height").value
        ];

        const chosenWallNames = Array.from(document.getElementsByClassName("gui-checkbox"))
            .filter(c => c.checked)
            .map(w => w.value);

        kitchen.removeAll();

        const floor = new Floor(width, depth,
            m => m.translateZ(depth /2),
            m => m.rotateX(- Math.PI / 2 )
        );
        kitchen.setFloor(floor);

        const factories = wallsFactories(width, depth, height);

        chosenWallNames.forEach(wallName => {
            const wall = factories.get(wallName)();
            kitchen.addWall(wall);
            kitchen.fillWallWithModules(wall);
        })
    }
    document.getElementById("drawKitchenButton").addEventListener('click', loadKitchen);
    renderer.canvas().addEventListener('dblclick', () => camera.centerCamera());

    modulesLibrary.loadPrototypes([
        { url: 'models/szafka_dol.obj', type: ModuleTypes.STANDING },
        { url: 'models/blat.obj', type: ModuleTypes.TABLETOP },
        { url: 'models/szafka_gora.obj', type: ModuleTypes.HANGING }
    ]);

    window.scene = scene; //for three.js inspector
    scene.add(light);

    document.getElementById("canvasContainer").appendChild( renderer.canvas() );

    mouseTracker.registerMouseMoveListener();
    renderer.canvas().addEventListener('click', () => moduleSelector.selectModule(), false);

    kitchen.subscribe(msg => {
        if (msg.type === "ADD") {
            document.getElementById("modulesList").innerHTML += `<li>${msg.obj.type.toString()}${msg.obj.mesh.name}</li>`;
        }
        if (msg.type === "REMOVEALL") {
            document.getElementById("modulesList").innerHTML = '';
        }
    })
}

function wallsFactories(width, depth, height) {

    const axisY = new THREE.Vector3(0, 1, 0);

    const wallA = () => new Wall("A", width, height);

    const wallB = () => new Wall("B", depth, height,
        m => {
            m.translateX(width/2);
            m.translateZ(depth/2);
        },
        m => m.rotateOnWorldAxis(axisY, - Math.PI / 2)
    );

    const wallC = () => new Wall("C", width, height,
        m => m.translateZ(depth),
        m => m.rotateZ(Math.PI)
    );

    const wallD = () => new Wall("D", depth, height,
        m => {
            m.translateX(-width/2);
            m.translateZ(depth/2);
        },
        m => m.rotateOnWorldAxis(axisY, Math.PI / 2)
    );

    return new Map([["A", wallA], ["B", wallB], ["C", wallC], ["D", wallD]]);
}

function animate() {
	requestAnimationFrame( animate );
    camera.lookAtScene();
    renderer.render();
}