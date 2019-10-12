import {Wall} from "./kitchen";
import {Maps} from "../../utils/lang";

export enum Direction {
    TO_LEFT = "TO_LEFT", TO_RIGHT = "TO_RIGHT"
}
export class Corner {
    constructor(public readonly left:string, public readonly right:string) {}

    contains(wall: string) {
        return this.left === wall || this.right === wall;
    }
}
export class Settlement {
    constructor(
        public readonly corners:Corner[],
        public readonly modulesCount: Map<string, number>,
        public readonly wallHoleSize: Map<string, number>,
        public readonly fillDirection: Map<string, Direction>,
        public readonly modulesOffsetForIndex: Map<string, (index:number) => number>
    ) {}

}

export class Settler {

    constructor(
        private readonly slotWidth:number,
        private readonly cornerWidth:number
    ) {}

    settle(walls:Map<string, Wall>) {

        const corners: Corner[] = this.setupCorners(walls);

        const modulesCount = Maps.mapValues(walls, wall => this.count(wall, corners));
        const wallsHoleSizes = Maps.mapValues(walls, wall => this.holeSize(wall, corners));
        const directions = Maps.mapValues(walls, wall => this.goLeftIfCornerOnRight(wall.name, corners));

        const offsets = Maps.mapValues(walls, wall => {
            const direction = directions.get(wall.name);
            return (index) => {
                if (index === 0) return 0;
                return ( (direction === Direction.TO_LEFT ? -1 : 1) * ((index-1) * this.slotWidth + this.calcOffset(wall.name, directions, corners) ) );
            }
        });

        return new Settlement(corners, modulesCount, wallsHoleSizes, directions, offsets);
    };

    private count(wall:Wall, corners:Corner[]) {
        return Math.floor(this.spaceForModules(wall, corners) / this.slotWidth);
    }

    private holeSize(wall:Wall, corners:Corner[]): number {
        return this.spaceForModules(wall, corners) % this.slotWidth;
    }

    private spaceForModules(wall:Wall, corners:Corner[]) {
        const cornersCount = corners.filter(c => c.contains(wall.name)).length;
        return wall.width - (cornersCount * this.cornerWidth);
    }

    private goLeftIfCornerOnRight(wall: string, corners: Corner[]): Direction {
        return corners.find(c => c.left === wall) !== undefined ? Direction.TO_LEFT : Direction.TO_RIGHT;
    }

    private calcOffset(wall: string, fillDirection: Map<string, Direction>, corners: Corner[]) {
        if (fillDirection.get(wall) === Direction.TO_LEFT)
            return corners.find(c => c.left === wall) !== undefined ? this.cornerWidth : 0;

        if (fillDirection.get(wall) === Direction.TO_RIGHT)
            return corners.find(c => c.right === wall) !== undefined ? this.cornerWidth : 0;

        return 0;
    }

    private setupCorners(walls:Map<string, Wall>) {
        const corners = new Array<Corner>();

        const addCornerIfExist = (left, right) => {
            if (walls.has(left) && walls.has(right)) corners.push(new Corner(left, right));
        };

        addCornerIfExist("A", "B");
        addCornerIfExist("B", "C");
        addCornerIfExist("C", "D");
        addCornerIfExist("D", "A");

        return corners;
    };

}