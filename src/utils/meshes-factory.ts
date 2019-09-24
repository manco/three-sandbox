import {PromisingLoader} from "./loader";
import {Mesh} from "three";
import {MeshLambertMaterial} from "three";
import {Meshes} from "./meshes";

export class MeshFactory {
    private readonly loader = new PromisingLoader();
    private static readonly Scale: number = 2.535;
    private prototypes: Map<String, Mesh> = null;

    loadPrototypes():Promise<void> {
        if (this.prototypes === null) {
            return Promise.all(
                Array.from(MeshMetaData.entries()).map(
                    e =>
                        this.loader.loadSingleMesh(e[1])
                            .then(m => {
                                MeshFactory.initMesh(m);
                                return [e[0], m] as [string, Mesh]
                            })
                )
            )
                .then(meshes => {
                    this.prototypes = new Map<string, Mesh>(meshes);
                });
        } else {
            return Promise.resolve();
        }
    }

    private static initMesh(m:Mesh): void {
        m.geometry.scale(MeshFactory.Scale, MeshFactory.Scale, MeshFactory.Scale).computeBoundingBox();
    }

    ofType(type:string):Mesh {
        return this.prototypes.get(type);
    }

    create(type:string):Mesh {
        const mesh = this.ofType(type).clone();
        if (Meshes.hasFront(mesh)) {
            mesh.material = [new MeshLambertMaterial(), new MeshLambertMaterial()];
        } else {
            mesh.material = new MeshLambertMaterial();
        }
        return mesh;
    }
}

const MeshMetaData = new Map([
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
    ['standing_4', 'models/szuflady_4.obj']
]);