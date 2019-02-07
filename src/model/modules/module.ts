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
    public readonly id: string = this.mesh.uuid;
    private readonly colorMaterial;
    private readonly frontMaterial;

    constructor(
        readonly mesh: Mesh,
        readonly type: ModuleType,
        public subtype: ModuleSubtype,
        public moduleFunction: ModuleFunction,
        readonly width: number,
        readonly depth: number,
        private readonly rotateFun: MutateMeshFun
    ) {
        if (Array.isArray(mesh.material)) {
            this.colorMaterial = mesh.material[1] as MeshLambertMaterial;
            this.frontMaterial = mesh.material[0] as MeshLambertMaterial;
        } else {
            this.colorMaterial = this.frontMaterial = mesh.material as MeshLambertMaterial;
        }
    }

    initRotation(): void {
        this.rotateFun(this.mesh);
    }

    setColor(texture:Texture): void {
        Module.setTexture(this.colorMaterial, texture);
    }

    getColor(): Texture {
        return this.colorMaterial.map;
    }

    getFrontTexture(): Texture {
        return this.frontMaterial.map;
    }

    setFrontTexture(texture: Texture):void {
        Module.setTexture(this.frontMaterial, texture);
    }

    private static setTexture(material: MeshLambertMaterial, texture: Texture) {
        material.map = texture;
        material.needsUpdate = true;
    }
}