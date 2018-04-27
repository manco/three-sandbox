class LoggingLoader {
    constructor(manager) {
        this.onProgress = (xhr) => {
            if (xhr.lengthComputable) {
                const percentComplete = xhr.loaded / xhr.total * 100;
                console.log(Math.round(percentComplete) + '% downloaded');
            }
        };
        this.onError = (xhr) => { };
        this.loader = new THREE.OBJLoader(manager);
    }
    load(url, onLoadFun) {
        this.loader.load(
            url, onLoadFun, this.onProgress, this.onError
        );
    }
}

const camera = createCamera();
function createCamera() {
    const c = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 2000 );
    c.position.z = 250;
    const pointLight = new THREE.PointLight(0xffffff, 0.8);
    c.add(pointLight);
    return c;
}
const renderer = createRenderer();
function createRenderer() {
    const r = new THREE.WebGLRenderer();
    r.setPixelRatio( window.devicePixelRatio );
    r.setSize( window.innerWidth, window.innerHeight );
    return r;
}
const scene = createScene();
function createScene() {
    const s = new THREE.Scene();
    const ambientLight = new THREE.AmbientLight(0xcccccc, 0.4);
    s.add( ambientLight );
    return s;
}
function createObjLoader() {
    const manager = new THREE.LoadingManager();
    manager.onProgress = ( item, loaded, total ) => console.log( item, loaded, total );
    return new LoggingLoader(manager);
}

let container;
let mouseX = 0, mouseY = 0;
let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

init();
animate();


function init() {
	container = document.createElement( 'div' );
	document.body.appendChild( container );
    const loader = createObjLoader();
    loader.load(
        'https://threejs.org/examples/models/obj/male02/male02.obj',
        (object) => {
            object.position.y = -95;
            scene.add(object);
        }
        );
	scene.add( camera );

	container.appendChild( renderer.domElement );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
	windowHalfX = window.innerWidth / 2;
	windowHalfY = window.innerHeight / 2;
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseMove( event ) {
	mouseX = ( event.clientX - windowHalfX ) / 2;
	mouseY = ( event.clientY - windowHalfY ) / 2;
}

function animate() {
	requestAnimationFrame( animate );
	render();
}

function render() {
	camera.position.x += ( mouseX - camera.position.x ) * .05;
	camera.position.y += ( - mouseY - camera.position.y ) * .05;
	camera.lookAt( scene.position );
	renderer.render( scene, camera );
}