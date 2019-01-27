import {Module} from "../../model/modules/module";
import {Mesh} from "three";
import {ModuleType} from "../../model/modules/types";
import {Meshes} from "./meshes";
import {Lang} from "../../utils/lang";
import {BufferGeometry} from "three";
import {MeshLambertMaterial} from "three";

export class Modules {
    static module(type: ModuleType = null, mesh: Mesh = Meshes.mesh()):Module {
        mesh.material = new MeshLambertMaterial();
        return new Module(mesh, type, null, null, 50, 30, Lang.noop);
    }

    static moduleWithFront(type: ModuleType = null, mesh: Mesh = Meshes.mesh()):Module {
        mesh.material = [new MeshLambertMaterial(), new MeshLambertMaterial()];
        const g = mesh.geometry as BufferGeometry;
        g.clearGroups();
        g.addGroup(0, 1, 0);
        g.addGroup(1, 99, 1);
        return new Module(mesh, type, null, null, 50, 30, Lang.noop);
    }
}