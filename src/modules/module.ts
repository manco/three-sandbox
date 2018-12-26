import {Mesh} from "three";
import {MeshLambertMaterial} from "three";
import {MutateMeshFun} from "../utils/utils";
import {ModuleType} from "./types";
import {ModuleSubtype} from "./types";

export class ModuleDefinition {
    constructor(
        readonly url: string,
        readonly type: ModuleType
    ) {
    }
}

export class Module {
    private readonly id: string;

    constructor(
        readonly mesh: Mesh,
        readonly type: ModuleType,
        readonly subtype: ModuleSubtype,
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
        const cloned = new Module(this.mesh.clone(), this.type, this.subtype, this.width, this.depth, this.rotateFun);
        cloned.mesh.material = new MeshLambertMaterial();
        return cloned;
    }
}