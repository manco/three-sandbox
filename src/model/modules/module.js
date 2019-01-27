import { MeshLambertMaterial } from "three";
export class ModuleDefinition {
    constructor(url, type) {
        this.url = url;
        this.type = type;
    }
}
export class Module {
    constructor(mesh, type, subtype, moduleFunction, width, depth, rotateFun) {
        this.mesh = mesh;
        this.type = type;
        this.subtype = subtype;
        this.moduleFunction = moduleFunction;
        this.width = width;
        this.depth = depth;
        this.rotateFun = rotateFun;
        this.id = this.mesh.uuid;
        this.hasFront = this.mesh.geometry.groups.length > 0;
    }
    initRotation() {
        this.rotateFun(this.mesh);
    }
    clone() {
        const cloned = new Module(this.mesh.clone(), this.type, this.subtype, this.moduleFunction, this.width, this.depth, this.rotateFun);
        cloned.mesh.material = new MeshLambertMaterial();
        return cloned;
    }
    setBackTexture(texture) {
        this.setTexture(this.backMaterial(), texture);
    }
    getBackTexture() {
        return this.backMaterial().map;
    }
    backMaterial() {
        if (this.hasFront) {
            //TODO material type definition
            return this.mesh.material[1];
        }
        return this.mesh.material;
    }
    frontMaterial() {
        if (this.hasFront) {
            //TODO material type definition
            return this.mesh.material[0];
        }
        throw "module has no front!";
    }
    setFrontTexture(texture) {
        this.setTexture(this.frontMaterial(), texture);
    }
    setTexture(material, texture) {
        material.map = texture;
        this.frontMaterial().needsUpdate = true;
    }
}
