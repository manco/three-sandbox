import {Color, Mesh, MeshLambertMaterial} from "three";

export class MeshSelector {
    private readonly SelectionColor: number = 0x00ff00;
    private selected:Mesh = null;
    private previousSelectedEmissiveColor:number = null;

    select(mesh: Mesh):void {
        if (this.selected !== null) {
            MeshSelector.emissive(this.selected).setHex(this.previousSelectedEmissiveColor);
            this.selected = null;
        }
            this.previousSelectedEmissiveColor = MeshSelector.emissive(mesh).getHex();
            this.selected = mesh;
            MeshSelector.emissive(this.selected).setHex(this.SelectionColor);
    }

    private static emissive(mesh:Mesh): Color {
        return ((Array.isArray(mesh.material) ? mesh.material[0] : mesh.material)as MeshLambertMaterial).emissive;
    }
}