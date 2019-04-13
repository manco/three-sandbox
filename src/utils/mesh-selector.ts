import {Color, Mesh, MeshLambertMaterial} from "three";

export class MeshSelector {
    private readonly SelectionColor: number = 0x00ff00;
    private selected:Mesh = null;
    private previousSelectedEmissiveColor:number = null;

    select(mesh: Mesh):void {
        if (this.selected !== null) {
            MeshSelector.emissive(this.selected).forEach(c => c.setHex(this.previousSelectedEmissiveColor));
            this.selected = null;
        }
        if (mesh !== null) {
            this.previousSelectedEmissiveColor = MeshSelector.emissive(mesh)[0].getHex();
            this.selected = mesh;
            MeshSelector.emissive(this.selected).forEach(c => c.setHex(this.SelectionColor));
        }
    }

    private static emissive(mesh:Mesh): Color[] {
        return MeshSelector.emissiveArray(Array.isArray(mesh.material) ? mesh.material : [mesh.material])
    }

    private static emissiveArray(materials): Color[] {
        return materials.map(m=>(m as MeshLambertMaterial).emissive);
    }
}