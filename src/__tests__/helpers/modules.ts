import {Module} from "../../model/modules/module";
import {Mesh} from "three";
import {ModuleType} from "../../model/modules/types";
import {Meshes} from "./meshes";
import {Lang} from "../../utils/lang";

export class Modules {
    static module(type: ModuleType = null, mesh: Mesh = Meshes.mesh()):Module {
        return new Module(mesh, type, null, null, 50, 30, Lang.noop);
    }
}