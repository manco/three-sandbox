import {ModuleType} from "../modules/types";
import {Mesh} from "three";

export class Obstacle {
    constructor (
        readonly placement:PlacementInfo,
        readonly type:ObstacleType
    ) {}

    static of(
        width:number,
        height:number,
        wallName: string,
        distanceToAxis: number,
        type:ObstacleType
    ) {
        return new Obstacle(new PlacementInfo(new Dimensions2D(width, height), wallName, distanceToAxis), type);
    }

    private _mesh;

    get mesh() { return this._mesh; }

    init(mesh: Mesh) {
        this._mesh = mesh;
    }

    overlapping(type: ModuleType): boolean {
        if (this.type === ObstacleType.DOOR) return true;
        if (this.type === ObstacleType.WINDOW) return type === ModuleType.HANGING;
        return type === ModuleType.STANDING ||
            (type === ModuleType.TABLETOP && this.placement.height + 20 >= (90 - 20)) ||
            (type === ModuleType.HANGING && this.placement.height + 20 >= (150 - 20))
            ;
    }
}

export class PlacementInfo {
    constructor(
        private readonly dimensions: Dimensions2D,
        readonly wallName: string,
        public readonly distanceToAxis: number //distance from right wall to obstacle axis
    ) {}
    public readonly height :number = this.dimensions.height;
    public readonly width :number = this.dimensions.width;
    public readonly distanceToRightEdge :number = this.distanceToAxis - this.width/2;
    public readonly distanceToLeftEdge :number = this.distanceToAxis + this.width/2;

}

export enum ObstacleType {
    DOOR = "DOOR", WINDOW = "WINDOW", RADIATOR = "RADIATOR"
}
export const ObstacleTypeAll = [ ObstacleType.DOOR, ObstacleType.WINDOW, ObstacleType.RADIATOR ];

export class Dimensions2D {
    constructor(
        public readonly width:number,
        public readonly height:number
    ) {}
    isValid(): Boolean { return isFinite(this.width) && isFinite(this.height) }
}
