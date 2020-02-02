import {ModuleType} from "../modules/types";

export class Obstacle {
    constructor (
        readonly placement:PlacementInfo,
        readonly type:ObstacleType
    //private readonly mesh;
    ) {}

    overlapping(type: ModuleType): boolean {
        if (this.type === ObstacleType.DOOR) return true;
        if (this.type === ObstacleType.WINDOW) return type === ModuleType.HANGING;
        return type === ModuleType.STANDING ||
            (type === ModuleType.TABLETOP && this.placement.height() + 20 >= (90 - 20)) ||
            (type === ModuleType.HANGING && this.placement.height() + 20 >= (150 - 20))
            ;
    }
}

export class PlacementInfo {
    constructor(
        private readonly dimensions: Dimensions2D,
        readonly wallName: string,
        private readonly distanceToAxis: number //distance from right wall to obstacle axis
    ) {}
    distanceToRightEdge():number { return this.distanceToAxis - this.dimensions.width/2; }
    distanceToLeftEdge():number { return this.distanceToAxis + this.dimensions.width/2; }
    height():number { return this.dimensions.height; }
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
