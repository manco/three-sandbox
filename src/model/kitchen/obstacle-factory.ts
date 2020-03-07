import {MeshFactory} from "../../utils/meshes-factory";
import {Obstacle, ObstacleType} from "./obstacle";
import {Meshes} from "../../utils/meshes";

export default class ObstacleFactory {
    constructor(private readonly meshFactory: MeshFactory) {}
    create(obstacle: Obstacle) {
        const mesh = this.meshFactory.create(ObstacleTypeToMesh.get(obstacle.type));
        mesh.geometry.scale(
            obstacle.placement.width/Meshes.meshWidthX(mesh),
            1,
            obstacle.placement.height/Meshes.meshHeightZ(mesh)
        );
        mesh.geometry.computeBoundingBox();
        return mesh;
    }
}

const ObstacleTypeToMesh = new Map([
  [ObstacleType.DOOR, 'door'],
  [ObstacleType.RADIATOR, 'radiator'],
  [ObstacleType.WINDOW, 'window']
]);