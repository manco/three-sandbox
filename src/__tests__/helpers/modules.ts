import {Module} from "../../model/modules/module";
import {Meshes} from "./meshes";
import {Utils} from "../../utils/utils";
import {Mesh} from "three";
import {ModuleType} from "../../model/modules/types";

export class Modules {
    static module(type: ModuleType = null, mesh: Mesh = Meshes.mesh()):Module {
        return new Module(mesh, type, null, 50, 30, Utils.noop);
    }
}