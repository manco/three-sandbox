import {PromisingLoader} from "./loader";
import {Mesh} from "three";
import {MeshLambertMaterial} from "three";
import {Meshes} from "./meshes";

export class MeshFactory {
    private readonly loader = new PromisingLoader();
    private prototypes: Map<String, Mesh> = null;

    loadPrototypes():Promise<void> {
        if (this.prototypes === null) {
            return Promise
                .all(ExternalMeshMetaData.map(this.load))
                .then(meshes => meshes.concat(SimpleMeshes))
                .then(this.initMeshes);
        } else {
            return Promise.resolve();
        }
    }

    private initMeshes = (meshes: [string, Mesh][]) => {
        meshes.forEach(([, mesh]) => mesh.geometry.computeBoundingBox());
        this.prototypes = new Map<string, Mesh>(meshes);
    };

    private load = ([name, path]) => this.loader.loadSingleMesh(path).then(m => [name, m]);

    ofType(type:string):Mesh {
        return this.prototypes.get(type);
    }

    create(type:string):Mesh {
        const mesh = this.ofType(type).clone();
        mesh.geometry = mesh.geometry.clone();
        if (Meshes.hasFront(mesh)) {
            mesh.material = (mesh.material as Array<Object>).map(_ => new MeshLambertMaterial());
        } else {
            mesh.material = new MeshLambertMaterial();
        }
        return mesh;
    }
}

const ExternalMeshMetaData = [
    ['corner_standing', 'models/corner_szafka_dol.obj'],
    ['corner_tabletop', 'models/corner_blat.obj'],
    ['corner_hanging', 'models/corner_szafka_gora.obj'],
    ['standing', 'models/szafka_dol.obj'],
    ['tabletop', 'models/blat.obj'],
    ['tabletop_sink_chamber_1', 'models/zlew+blat_jednokomorowy.obj'],
    ['tabletop_sink_chamber_2', 'models/zlew+blat_dwukomorowy.obj'],
    ['tabletop_sink_chamber_drainer', 'models/zlew+blat_ociekacz.obj'],
    ['hanging', 'models/szafka_gora.obj'],
    ['standing_11', 'models/szuflady_1+1.obj'],
    ['standing_211', 'models/szuflady_2+1+1.obj'],
    ['standing_21', 'models/szuflady_2+1.obj'],
    ['standing_23', 'models/szuflady_2+3.obj'],
    ['standing_4', 'models/szuflady_4.obj'],
    ['fridge', 'models/lodowka.obj'],
    ['door', 'obstacles/door.obj']
];

const SimpleMeshes: [string, Mesh][] = [
    // ['door', box('door', 100, 200, 10)],
    // ['window', box('window', 100, 100, 10)],
    // ['radiator', box('radiator', 100, 60, 10)]
];

// function box(name:string, width:number, height:number, depth:number): Mesh {
//     const g = new BoxBufferGeometry( width, depth, height, 2, 2, 2);
//     const m = new Mesh(g);
//     m.name = name;
//     return m;
// }