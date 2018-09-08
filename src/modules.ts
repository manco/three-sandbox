import {PromisingLoader} from "./utils/loader";
import {Utils, MutateMeshFun} from "./utils/utils";
import {Mesh, MeshLambertMaterial} from "three";

export class ModuleDefinition {
    constructor(
        readonly url:string,
        readonly type:ModuleType
    ) {}
}

export class Module {
    private readonly id: string;
    constructor(
        readonly mesh:Mesh,
        readonly type:ModuleType,
        readonly subtype: ModuleSubtype,
        readonly width:number,
        readonly depth:number,
        private readonly rotateFun:MutateMeshFun
    ) {
        this.id = mesh.uuid;
    }
    initRotation():void {
        this.rotateFun(this.mesh);
    }
    clone():Module {
        const cloned = new Module(this.mesh.clone(), this.type, this.subtype, this.width, this.depth, this.rotateFun);
        cloned.mesh.material = new MeshLambertMaterial();
        return cloned;
    }
}

export class ModulesLibrary {
    private loader: PromisingLoader = new PromisingLoader();
    private readonly scale: number = 3;
    private prototypes: Promise<Module[]> = null;

    loadPrototypes(definitions: ModuleDefinition[]):void {
        if (this.prototypes == null) {
            this.prototypes = Promise.all(
                definitions.map(
                    (d:ModuleDefinition) =>
                        this.loader.loadSingleMesh(d.url)
                            .then((m:Mesh) => {
                                this.initMesh(m);
                                return new Module(
                                    m,
                                    d.type,
                                    ModuleSubtypesOfTypes.get(d.type)[0],
                                    this.scale * Utils.meshWidthX(m),
                                    this.scale * Utils.meshDepthY(m),
                                    (mm:Mesh):void => { mm.rotateX(-Math.PI / 2); }
                                );
                            })
                )
            );
        } else {
            throw "sorry, prototypes already loaded or being loaded";
        }
    }

    createModule(type:ModuleType):Promise<Module> {
        return this.ofType(type)
            .then((m:Module) => m.clone());
    }

    ofType(type:ModuleType):Promise<Module> {
        return this.prototypes
            .then((modules:Module[]) => modules.find((m:Module) => type === m.type));
    }

    initMesh(m:Mesh): void {
        m.castShadow = true;
        m.receiveShadow = true;
        m.scale.multiplyScalar(this.scale);
        m.geometry.computeBoundingBox();
    }
}

export enum ModuleType {
    STANDING, TABLETOP, HANGING
}

export enum ModuleSubtype {
    SHELVES, DRAWERS, SINK, OVEN, WASHER, FRIDGE
}
export const ModuleSubtypesOfTypes: Map<ModuleType, ModuleSubtype[]> = new Map([
    [ModuleType.STANDING, [ModuleSubtype.DRAWERS, ModuleSubtype.FRIDGE, ModuleSubtype.WASHER, ModuleSubtype.OVEN]],
    [ModuleType.TABLETOP, [null]],
    [ModuleType.HANGING, [ModuleSubtype.SHELVES]]
]);

export const ModuleTypesAll = Array.from(ModuleSubtypesOfTypes.keys());