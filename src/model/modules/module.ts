import {Mesh} from "three";
import {MeshLambertMaterial} from "three";
import {Texture} from "three";
import {MutateMeshFun} from "../../utils/meshes";
import {ModuleType} from "./types";
import {ModuleSubtype} from "./types";
import {ModuleFunction} from "./module-functions";
import {BufferGeometry} from "three";

export class ModuleDefinition {
    constructor(
        readonly url: string,
        readonly type: ModuleType
    ) {
    }
}

export class Module {
    public readonly id: string = this.mesh.uuid;
    private readonly hasFront = (this.mesh.geometry as BufferGeometry).groups.length > 0;

    constructor(
        readonly mesh: Mesh,
        readonly type: ModuleType,
        public subtype: ModuleSubtype,
        public moduleFunction: ModuleFunction,
        readonly width: number,
        readonly depth: number,
        private readonly rotateFun: MutateMeshFun
    ) { }

    initRotation(): void {
        this.rotateFun(this.mesh);
    }

    setColor(texture:Texture): void {
        Module.setTexture(this.colorMaterial(), texture);
    }

    getColor(): Texture {
        return this.colorMaterial().map;
    }

    getFrontTexture(): Texture {
        return this.frontMaterial().map;
    }

    private colorMaterial() {
        if (this.hasFront) {
            //TODO material type definition
            return this.mesh.material[1] as MeshLambertMaterial;
        }
        return this.mesh.material as MeshLambertMaterial;
    }

    private frontMaterial() {
        if (this.hasFront) {
            //TODO material type definition
            return this.mesh.material[0] as MeshLambertMaterial;
        }
        throw "module has no front!";
    }

    setFrontTexture(texture: Texture):void {
        Module.setTexture(this.frontMaterial(), texture);
    }

    private static setTexture(material: MeshLambertMaterial, texture: Texture) {
        material.map = texture;
        material.needsUpdate = true;
    }
}