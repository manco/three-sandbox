import {Mesh} from "three";
import {MeshLambertMaterial} from "three";
import {Texture} from "three";
import {Meshes} from "../../utils/meshes";
import {ModuleType} from "./types";
import {ModuleSubtype} from "./types";
import {ColorType} from "../colors";
import {ModuleFunction} from "./types";
import {ModuleTypeCorners} from "./types";
import {ResizeStrategy} from "./resizing";
import {ResizeStrategyFactory} from "./resizing";

export class Module {

    public readonly id: string = this.mesh.uuid;
    private readonly colorMaterial;
    private readonly frontMaterial;
    private readonly hasFront = Meshes.hasFront(this.mesh);
    private _width: number;
    private _depth: number;
    constructor(
        readonly mesh: Mesh,
        readonly type: ModuleType,
        public subtype: ModuleSubtype,
        public readonly moduleFunction: ModuleFunction,
        public color: ColorType,
        public readonly resize: ResizeStrategy
    ) {
        this.recalculateDimensions();
        if (this.isResized()) {
            resize.applyOn(this);
            this.recalculateDimensions();
        }
        if (this.hasFront) {
            this.colorMaterial = mesh.material[1] as MeshLambertMaterial;
            this.frontMaterial = mesh.material[0] as MeshLambertMaterial;
        } else {
            this.colorMaterial = mesh.material as MeshLambertMaterial;
        }
    }

    isResized():boolean {
        return this.resize !== ResizeStrategyFactory.NOOP;
    }

    isCorner():boolean {
        return ModuleTypeCorners.get(this.type) === this.moduleFunction;
    }

    initWireframe(): void {
        if (this.type !== ModuleType.TABLETOP) Meshes.showWireframe(this.mesh, false);
    }

    private recalculateDimensions(): void {
        this._width = Meshes.meshWidthX(this.mesh);
        this._depth = Meshes.meshDepthY(this.mesh);
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

    get depth(): number {
        return this._depth;
    }
    get width(): number {
        return this._width;
    }
}