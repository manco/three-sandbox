/*
    TODO

    1. move codebase to typescript
    2. split codebase into multiple files
    3. think of IoC regarding building scene

    4. kitchen should have field slotWidth
    6. Floor / MeshGrid / Wall better class design
    7. KitchenSlots should be implemented as stream
    8. unit tests. It's time for unit tests

    (...)

    * try to display outlines of obj's
    * panel klienta (podawanie wymiarów)
    * wypełnienie całej ściany na podstawie wymiarów
    * podawanie koloru korpusów (brył)
    * ROZPOZNANIE: nakładanie tekstur, jak to się robi i czy łatwiej mieć osobną bryłę?
    * ROZPOZNANIE: raytracing z kursora do szafki (zaznaczanie aktywnej szafki)
    * Lista szafek z boku
    * Przycisk 'zamów' i wysłanie emaila <--- jak to zabezpieczyć?
    *
 */

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
                console.warn(`loadSingleMesh: ${url} resolved to group of meshes: ${obj.children}`)
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
        const helper = new THREE.GridHelper(MeshGrid.meshWidth(mesh), elementsCount);
        helper.position.y = mesh.position.y + 1;
        helper.material.opacity = 1;
        helper.name = mesh.name + "Grid";
        return helper;
    }

    static meshWidth(mesh) {
        return mesh.geometry.parameters.width;
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

class Module {
    constructor(mesh, type, width) {
        this.mesh = mesh;
        this.type = type;
        this.width = width;
    }
    clone() {
        return new Module(this.mesh.clone(), this.type, this.width);
    }
}
class ModulesLibrary {
    constructor() {
        this.loader = new PromisingLoader();
        this.scale = 3;
        this.prototypes = null;
    }
    loadPrototypes(definitions) {
        if (this.prototypes == null) {
            this.prototypes = Promise.all(
                definitions.map(
                    d =>
                        this.loader.loadSingleMesh(d.url)
                            .then(m => {
                                this.initMesh(m);
                                const bbox = m.geometry.boundingBox;
                                const width = this.scale * (bbox.max.x - bbox.min.x);
                                return new Module(m, d.type, width)
                            })
                )
            );
        } else {
            throw "sorry, prototypes already loaded or being loaded";
        }
    }

    createModule(type) {
        return this.ofType(type)
            .then(m => m.clone());
    }

    ofType(type) {
        return this.prototypes
            .then(modules => modules.find(m => m.type === type));
    }

    initMesh(m) {
        m.rotateX(-Math.PI / 2);
        m.position.set(0, 0, 0);
        m.castShadow = true;
        m.receiveShadow = true;
        m.scale.multiplyScalar(this.scale);
        m.geometry.computeBoundingBox();
    }
}
const ModuleTypes = makeEnum(["STANDING", "TABLETOP", "HANGING"]);

class KitchenSlot {
    constructor() {
        this.modulesByTypes = new Map()
    }
    alreadyContains(moduleType) {
        return this.modulesByTypes.has(moduleType);
    }
    put(module, index, scene) {
        if (this.alreadyContains(module.type)) {
            throw "module already set in this slot"
        }
        this.modulesByTypes.set(module.type, module);
        module.mesh.position.x = index * module.width;
        scene.add(module.mesh);
    }
    remove(moduleType, scene) {
        const module = this.modulesByTypes.get(moduleType);
        scene.remove(module.mesh);
        this.modulesByTypes.delete(moduleType);
    }
}
class Kitchen {
    constructor(library, scene) {
        this.moduleLibrary = library;
        this.scene = scene;

        this.slots = Array.from(new Array(10), () => new KitchenSlot());
    }
    addModule(moduleType) {
        const availableSlotIndex = this.slots.findIndex(s => !s.alreadyContains(moduleType));
        if (availableSlotIndex === -1) {
            console.log("no more available slots :(")
        } else {
            this.moduleLibrary
                .createModule(moduleType)
                .then(m => this.slots[availableSlotIndex].put(m, availableSlotIndex, scene));
        }
    }

    removeModule(moduleType) {
        const occupiedSlotIndex = this.slots.findIndex(s => s.alreadyContains(moduleType));
        if (occupiedSlotIndex === -1) {
            console.log("no occupied slots")
        } else {
            this.slots[occupiedSlotIndex].remove(moduleType, scene);
        }
    }
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

const modulesLibrary = new ModulesLibrary();
const kitchen = new Kitchen(modulesLibrary, scene);

init();
animate();

function init() {
	const container = document.createElement( 'div' );
	document.body.appendChild( container );

	scene.add(camera);
	scene.add(light);

    modulesLibrary.loadPrototypes([
        { url: 'models/szafka_dol.obj', type: ModuleTypes.STANDING },
        { url: 'models/blat.obj', type: ModuleTypes.TABLETOP },
        { url: 'models/szafka_gora.obj', type: ModuleTypes.HANGING }
    ]);

    kitchen.addModule(ModuleTypes.STANDING);
    kitchen.addModule(ModuleTypes.TABLETOP);
    kitchen.addModule(ModuleTypes.HANGING);

    const moduleWidthF = modulesLibrary.ofType(ModuleTypes.STANDING).then(m => m.width);

    moduleWidthF.then(moduleWidth => {
        new Floor(moduleWidth).addTo(scene);
        new Wall(moduleWidth).addTo(scene);
    });

	container.appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
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

function makeEnum(arr){
    let obj = {};
    for (let val of arr){
        obj[val] = Symbol(val);
    }
    return Object.freeze(obj);
}