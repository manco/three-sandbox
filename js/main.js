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
    load(url) {
        return new Promise(
            (resolve) => this.loader.load(url, resolve, this.onProgress, this.onError)
        );
    }
}

const camera = createCamera();
function createCamera() {
    const c = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 3000 );
    c.position.z = 250;
    c.position.x = 0;
    c.position.y = 150;
    c.add(new THREE.PointLight(0xffffff, 0.8));
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
    s.add( new THREE.AmbientLight(0xcccccc, 0.4) );
    s.add( new THREE.GridHelper( 1000, 10 ) );
    s.add(new THREE.AxesHelper(300));
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

	scene.add(camera);

    const modelsF = loadModels();
    modelsF.then(
        models => {
            models.forEach(m => { scene.add(m); } )
        } );

	container.appendChild( renderer.domElement );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	window.addEventListener( 'resize', onWindowResize, false );
}

function loadModels() {
    const loader = createObjLoader();
    const m1 =
        loader.load('models/modul_01.obj')
        .then((obj) => { obj.position.set(-600, -90, -20); return obj; });
    const m2 =
        loader.load('models/modul_02.obj')
        .then((obj) => { obj.position.set(-600, -60, -20); return obj; });
    const m3 =
        loader.load('models/modul_03.obj')
        .then((obj) => { obj.position.set(-600, -30, -20); return obj; });

    return Promise.all([m1, m2, m3]);
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
	camera.lookAt( scene.position );
	renderer.render( scene, camera );
}