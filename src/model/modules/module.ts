import {Mesh} from "three";
import {MeshLambertMaterial} from "three";
import {Texture} from "three";
import {MutateMeshFun} from "../../utils/meshes";
import {ModuleType} from "./types";
import {ModuleSubtype} from "./types";
import {ModuleFunction} from "./module-functions";
import {ColorType} from "../colors";

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
    private readonly hasFront = Array.isArray(this.mesh.material);

    constructor(
        readonly mesh: Mesh,
        readonly type: ModuleType,
        public subtype: ModuleSubtype,
        public moduleFunction: ModuleFunction,
        public color: ColorType,
        readonly width: number,
        readonly depth: number,
        private readonly rotateFun: MutateMeshFun
    ) {
        if (this.hasFront) {
            this.colorMaterial = mesh.material[1] as MeshLambertMaterial;
            this.frontMaterial = mesh.material[0] as MeshLambertMaterial;
        } else {
            this.colorMaterial = mesh.material as MeshLambertMaterial;
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
        if (this.hasFront) {
            texture = texture === undefined ? this.getColor() : texture;
            Module.setTexture(this.frontMaterial, texture);
        }
    }

    private static setTexture(material: MeshLambertMaterial, texture: Texture) {
        material.map = texture;
        material.needsUpdate = true;
    }
}