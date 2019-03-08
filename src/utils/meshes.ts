import {Mesh} from "three";
import {PromisingLoader} from "./loader";
import {MeshLambertMaterial} from "three";

export class Meshes {
    static meshWidthX(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.x - bbox.min.x;
    }

    static meshDepthY(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.y - bbox.min.y;
    }

    static hasFront(mesh: Mesh) {
        return Array.isArray(mesh.material);
    }
}

export class MeshFactory {
    private readonly loader = new PromisingLoader();
    private static readonly Scale: number = 3;
    private prototypes: Map<String, Mesh> = null;

    loadPrototypes():Promise<void> {
        if (this.prototypes === null) {
            return Promise.all(
                Array.from(MeshMetaData.entries()).map(
                    e =>
                        this.loader.loadSingleMesh(e[1])
                            .then((m:Mesh) => {
                                MeshFactory.initMesh(m, e[0]);
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

    private static initMesh(m:Mesh, type: string): void {
        if (type == 'standing') {
            m.castShadow = true;
        }
        m.receiveShadow = true;
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
    ['standing', 'models/szafka_dol.obj'],
    ['tabletop', 'models/blat.obj'],
    ['hanging', 'models/szafka_gora.obj'],
    ['standing_11', 'models/szuflady_1+1.obj'],
    ['standing_211', 'models/szuflady_2+1+1.obj'],
    ['standing_21', 'models/szuflady_2+1.obj'],
    ['standing_23', 'models/szuflady_2+3.obj'],
    ['standing_4', 'models/szuflady_4.obj']
]);

export interface MutateMeshFun {
    (mesh:Mesh):void
}

