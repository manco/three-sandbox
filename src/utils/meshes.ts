import {Mesh} from "three";
import {PromisingLoader} from "./loader";

export class Meshes {
    static meshWidthX(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.x - bbox.min.x;
    }

    static meshDepthY(m:Mesh): number {
        const bbox = m.geometry.boundingBox;
        return bbox.max.y - bbox.min.y;
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
}

const MeshMetaData = new Map([
    ['standing', 'models/szafka_dol.obj'],
    ['tabletop', 'models/blat.obj'],
    ['hanging', 'models/szafka_gora.obj']
]);

export interface MutateMeshFun {
    (mesh:Mesh):void
}

