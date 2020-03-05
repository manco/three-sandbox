import {MeshFactory} from "../../utils/meshes-factory";
import {ObstacleType} from "./obstacle";

export default class ObstacleFactory {
    constructor(private readonly meshFactory: MeshFactory) {}
    create(type: ObstacleType) {
        return this.meshFactory.create(ObstacleTypeToMesh.get(type));
    }
}

const ObstacleTypeToMesh = new Map([
  [ObstacleType.DOOR, 'door'],
  [ObstacleType.RADIATOR, 'radiator'],
  [ObstacleType.WINDOW, 'window']
]);