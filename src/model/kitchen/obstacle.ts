export class Obstacle {
    constructor (
        readonly placement:PlacementInfo,
        readonly type:ObstacleType
    //private readonly mesh;
    ) {}
}

export class PlacementInfo {
    constructor(
        private readonly dimensions: Dimensions2D,
        readonly wallName: string,
        private readonly distanceToAxis: number //distance from right wall to obstacle axis
    ) {}
    distanceToRightEdge():number { return this.distanceToAxis - this.dimensions.width/2; }
    distanceToLeftEdge():number { return this.distanceToAxis + this.dimensions.width/2; }
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
}
