/*
    TODO

    1. move codebase to typescript
    2. split codebase into multiple files
    3. think of IoC regarding building scene

    4. kitchen should have field slotWidth
    6. Floor / MeshGrid / Wall better class design
    7. KitchenSlots should be implemented as stream
    8. unit tests. It's time for unit tests

    9. load models from somewhere else

    (...)

    O try to display outlines of obj's
    * panel klienta (podawanie wymiarów)
    O wypełnienie całej ściany na podstawie wymiarów
    O podawanie koloru korpusów (brył)
    O ROZPOZNANIE: nakładanie tekstur, jak to się robi i czy łatwiej mieć osobną bryłę?
    O ROZPOZNANIE: raytracing z kursora do szafki (zaznaczanie aktywnej szafki)
    O Lista szafek z boku
    O Przycisk 'zamów' i wysłanie emaila <--- jak to zabezpieczyć?
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
    constructor() {
        const width = 1200;
        this.mesh = Floor.createFloor(width);
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
    }
}
class Wall {
    static createWall(name, width, height) {
        const material = new THREE.MeshPhongMaterial( {
            color: 0xa0adaf,
            shininess: 50,
            opacity: 0.3,
            transparent: true,
            specular: 0x111111,
            side: THREE.DoubleSide
        } );
        const mesh = new THREE.Mesh(new THREE.PlaneBufferGeometry(width, height), material );
        mesh.position.set(0, height / 2, 0);
        mesh.name = "Wall" + name;
        mesh.receiveShadow = true;
        return mesh;
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

function meshWidthX(m) {
    const bbox = m.geometry.boundingBox;
    return bbox.max.x - bbox.min.x;
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
                                return new Module(m, d.type, this.scale * meshWidthX(m))
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
const ModuleTypesAll = [ModuleTypes.STANDING, ModuleTypes.TABLETOP, ModuleTypes.HANGING];

/**
 * Need to know the original wall! (bbox.min.x, rotation etc...)
 */
class WallSlot {
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
    removeAll(scene) {
        Array.from(this.modulesByTypes.keys()).forEach(t => this.remove(t, scene));
    }
}
class Kitchen {
    constructor(library, scene) {
        this.moduleLibrary = library;
        this.scene = scene;

        this.wallAslots = Array.from(new Array(10), () => new WallSlot());
        this.walls = [];
    }

    addModule(moduleType) {
        const availableSlotIndex = this.wallAslots.findIndex(s => !s.alreadyContains(moduleType));
        if (availableSlotIndex === -1) {
            console.log("no more available slots :(")
        } else {
            this.addModule(moduleType, availableSlotIndex);
        }
    }
    addModule(moduleType, index) {
        this.moduleLibrary
            .createModule(moduleType)
            .then(m => this.wallAslots[index].put(m, index, scene));
    }
    addWall(wall) {
        this.walls.push(wall);
        this.scene.add(wall);
    }

    findWall(name) {
        return this.walls.find(w => w.name === ("Wall" + name))
    }

    removeModule(moduleType) {
        const occupiedSlotIndex = this.wallAslots.findIndex(s => s.alreadyContains(moduleType));
        if (occupiedSlotIndex === -1) {
            console.log("no occupied slots")
        } else {
            this.wallAslots[occupiedSlotIndex].remove(moduleType, scene);
        }
    }

    fillWallWithModules(wall) {
        if (wall.name !== "WallA") {
            console.warn("sorry, only Wall A supported for now:)");
            return;
        }
        this.slotWidthF().then(slotWidth => {
            const items = meshWidthX(wall) / slotWidth;
            for (let i = 0; i < items; i++) {
                ModuleTypesAll.forEach(type => this.addModule(type, i))
            }
        })
    }

    removeAll(scene) {
        this.wallAslots.forEach(slot => slot.removeAll(scene));
        this.walls.forEach(wall => scene.remove(wall));
        this.walls = [];
    }

    slotWidthF() {
        return this.moduleLibrary.ofType(ModuleTypes.STANDING).then(m => m.width);
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
	scene.add(camera);
	scene.add(light);

    modulesLibrary.loadPrototypes([
        { url: 'models/szafka_dol.obj', type: ModuleTypes.STANDING },
        { url: 'models/blat.obj', type: ModuleTypes.TABLETOP },
        { url: 'models/szafka_gora.obj', type: ModuleTypes.HANGING }
    ]);

    new Floor().addTo(scene);

    document.getElementById("WebGL-output").appendChild( renderer.domElement );
	window.addEventListener( 'resize', onWindowResize, false );
}

function onWindowResize() {
    setFrustum(camera);
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function drawKitchen() {
    kitchen.removeAll(scene);
    initWalls();
    initModules();
}

function initWalls() {

    const [ width, depth, height ] = [
        document.getElementById("kitchen-width").value,
        document.getElementById("kitchen-depth").value,
        document.getElementById("kitchen-height").value
    ];

    const wallA = Wall.createWall("A", width, height);

    const wallB = Wall.createWall("B", depth, height);
    wallB.position.x = width/2;
    wallB.position.z = depth/2;
    wallB.rotateY( - Math.PI / 2);

    const wallC = Wall.createWall("C", width, height);
    wallC.position.z = depth;

    const wallD = Wall.createWall("D", depth, height);
    wallD.position.x = -width/2;
    wallD.position.z = depth/2;
    wallD.rotateY(Math.PI / 2);
    [
        wallA,
        wallB,
        wallC,
        wallD
    ].forEach(wall => { wall.position.setY(height/2); wall.geometry.computeBoundingBox(); kitchen.addWall(wall, scene); } );
}

function initModules() {
    const chosenWalls = Array.from(document.getElementsByClassName("gui-checkbox"))
        .filter(c => c.checked)
        .map(w => kitchen.findWall(w.value));

    chosenWalls.forEach(wall => kitchen.fillWallWithModules(wall, scene))
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