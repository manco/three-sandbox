import {Mesh} from "three";
import {MeshLambertMaterial} from "three";
import {Texture} from "three";
import {MutateMeshFun} from "../../utils/meshes";
import {ModuleType} from "./types";
import {ModuleSubtype} from "./types";
import {ModuleFunction} from "./module-functions";

export class ModuleDefinition {
    constructor(
        readonly url: string,
        readonly type: ModuleType
    ) {
    }
}

export class Module {
    public readonly id: string;

    constructor(
        readonly mesh: Mesh,
        readonly type: ModuleType,
        public subtype: ModuleSubtype,
        public moduleFunction: ModuleFunction,
        readonly width: number,
        readonly depth: number,
        private readonly rotateFun: MutateMeshFun
    ) {
        this.id = mesh.uuid;
    }

    initRotation(): void {
        this.rotateFun(this.mesh);
    }

    clone(): Module {
        const cloned = new Module(this.mesh.clone(), this.type, this.subtype, this.moduleFunction, this.width, this.depth, this.rotateFun);
        cloned.mesh.material = new MeshLambertMaterial();
        return cloned;
    }

    setTexture(tex:Texture): void {
        this.material().map = tex;
        this.material().needsUpdate = true;
    }

    getTexture(): Texture {
        return this.material().map;
    }

    private material() { return (this.mesh.material as MeshLambertMaterial) }
}