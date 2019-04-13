import {MeshLambertMaterial} from "three";
import {Color} from "three";
import {ModuleSelector} from "../model/module-selector";
import {Modules} from "./helpers/modules";

test('selecting null should unselect module and mesh', () => {

    const moduleSelector = new ModuleSelector();

    const module = Modules.module();
    moduleSelector.selectModule(module);

    expect(((module.mesh.material) as MeshLambertMaterial).emissive).toEqual(new Color(0x00ff00));

    moduleSelector.selectModule(null);

    expect(((module.mesh.material) as MeshLambertMaterial).emissive).not.toEqual(new Color(0x00ff00));
});