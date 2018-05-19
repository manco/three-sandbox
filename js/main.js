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

class Floor {
    constructor(singleTileWidth) {
        const tiles = 20;
        const width = singleTileWidth * tiles;
        this.mesh = Floor.createFloor(width);
        this.grid = MeshGrid.createGrid(this.mesh, tiles);
    }
    static createFloor(width) {
        const material = new THREE.MeshPhongMaterial( {
            color: 0x6e6b72,
            shininess: 50,
            specular: 0x111111
        } );
        const g = new THREE.Mesh(
            new THREE.PlaneBufferGeometry( width, width ), material );
        g.rotateX( - Math.PI / 2 );
        g.name = "Floor";
        g.receiveShadow = true;
        return g;
    }
    addTo(scene) {
        scene.add(this.mesh);
        scene.add(this.grid);
    }
}
class MeshGrid {
    static createGrid(mesh, elementsCount) {
        const helper = new THREE.GridHelper(meshWidth(mesh), elementsCount);
        helper.position.y = mesh.position.y + 1;
        helper.material.opacity = 1;
        helper.name = mesh.name + "Grid";
        return helper;
    }
}

class Wall {
    constructor(singleTileWidth) {
        const tiles = 20;
        const width = singleTileWidth * tiles;
        this.mesh = Wall.createWall(width);
        this.grid = MeshGrid.createGrid(this.mesh, tiles);
        this.grid.rotateX( - Math.PI / 2 );
    }
    static createWall(width) {
        const material = new THREE.MeshPhongMaterial( {
            color: 0xa0adaf,
            shininess: 50,
            opacity: 1,
            transparent: false,
            specular: 0x111111
        } );
        const g = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, width), material );
        g.position.set(0, width / 2, 0);
        g.name = "Wall";
        g.receiveShadow = true;
        return g;
    }
    addTo(scene) {
        scene.add(this.mesh);
        scene.add(this.grid);
    }
}

function meshWidth(mesh) {
    return mesh.geometry.parameters.width;
}

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

var scene = createScene(); //var because I want it available as window.scene
function createScene() {
    const s = new THREE.Scene();
    s.add( new THREE.AmbientLight(0xcccccc, 0.4) );
    return s;
}

init();
animate();

function init() {
	const container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene.add(camera);
	scene.add(light);

    const modelsF = loadModels();
    const modelsScale = 3;
    modelsF.then(
        models => {
            models.forEach(m => {
                scene.add(m);
                m.rotateX(- Math.PI / 2);
                m.position.set(0, 0, 0);
                m.castShadow = true;
                m.receiveShadow = true;
                m.scale.multiplyScalar( modelsScale );
            }
            );
            models[0].geometry.computeBoundingBox();
            const bbox = models[0].geometry.boundingBox;
            const modelWidth = bbox.max.x - bbox.min.x;

            new Floor(modelWidth * modelsScale).addTo(scene);
            new Wall(modelWidth * modelsScale).addTo(scene);
        });

	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}

function loadModels() {
    const loader = new PromisingLoader();
    const m1 = loader.loadSingleMesh('models/szafka_dol.obj');
    const m2 = loader.loadSingleMesh('models/blat.obj');
    const m3 = loader.loadSingleMesh('models/szafka_gora.obj');

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