export class Obstacle {
    constructor (
    private readonly placement:PlacementInfo,
    private readonly type:ObstacleType
    //private readonly mesh;
    ) {}
}

export class PlacementInfo {
    constructor(
        private readonly dimensions: Dimensions2D,
        private readonly wallName: string,
        private readonly distance: number
    ) {}
}

export enum ObstacleType {
    DOOR, WINDOW, RADIATOR
}
export const ObstacleTypeAll = [ ObstacleType.DOOR, ObstacleType.WINDOW, ObstacleType.RADIATOR ];

export class Dimensions2D {
    constructor(
        public readonly width:number,
        public readonly height:number
    ) {}
}
