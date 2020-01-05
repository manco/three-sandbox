import {Wall} from "./kitchen";
import {Maps} from "../../utils/lang";
import {Put} from "./put";
import {WallName} from "./kitchen";
import {PutCorner} from "./put";

export enum Direction {
    TO_LEFT = "TO_LEFT", TO_RIGHT = "TO_RIGHT"
}
export namespace Direction {
    export const signum = (direction: Direction) => direction === Direction.TO_LEFT ? -1 : 1;
}
export class Corner {
    constructor(public readonly left:WallName, public readonly right:WallName) {}

    contains(wall: string) {
        return this.left === wall || this.right === wall;
    }
}
export class Settlement {
    constructor(
        public readonly corners:Corner[],
        public readonly forWalls: Map<string, WallSettlement>
    ) {}
}

export class WallSettlement {
    constructor(
        public readonly modulesCount: number,
        public readonly wallHoleSize: number,
        public readonly fillDirection: Direction,
        public readonly modulesOffsetForIndex: (index:number) => number
    ) {}
}

export class Settler {

    constructor(
        private readonly slotWidth:number,
        private readonly cornerWidth:number
    ) {}

    settle2(walls:Map<WallName, Wall>): Map<WallName, Put[]> {
        return Maps.mapValues(walls, wall => this.settle3(wall, this.setupCorners(walls)))
    }

    //maybe not all corners needed
    private settle3(wall: Wall, corners: Corner[]): Put[] {

        const commands = [];

        const direction = this.goLeftIfCornerOnRight(wall.name, corners);

        const maybeCorner = this.findCornerOnLeft(wall.name, corners); //'direction' already did it
        if (maybeCorner !== undefined) {
            commands.push(new PutCorner(this.slotWidth, direction));
        }

        return commands;
    }

    settle(walls:Map<WallName, Wall>): Settlement {

        const corners: Corner[] = this.setupCorners(walls);

        const wallSettlements = Maps.mapValues(walls, wall => {
            const direction = this.goLeftIfCornerOnRight(wall.name, corners);
            return new WallSettlement(
                this.count(wall, corners),
                this.holeSize(wall, corners),
                direction,
                this.indexOffset(wall.name, direction, corners)
            );
        });

        return new Settlement(corners, wallSettlements);
    }

    private count(wall:Wall, corners:Corner[]) {
        return Math.floor(this.spaceForModules(wall, corners) / this.slotWidth);
    }

    private holeSize(wall:Wall, corners:Corner[]): number {
        return this.spaceForModules(wall, corners) % this.slotWidth;
    }

    private spaceForModules(wall:Wall, corners:Corner[]) {
        const cornersCount = corners.filter(c => c.contains(wall.name)).length;
        return wall.floorWidth - cornersCount * this.cornerWidth;
    }

    private goLeftIfCornerOnRight(wall: WallName, corners: Corner[]): Direction {
        return this.findCornerOnLeft(wall, corners) !== undefined ? Direction.TO_LEFT : Direction.TO_RIGHT;
    }

    private findCornerOnLeft(wall: WallName, corners: Corner[]) {
        return corners.find(c => c.left === wall);
    }

    private calcCornerOffset(wall: string, direction:Direction, corners: Corner[]) {
        if (direction === Direction.TO_LEFT)
            return corners.find(c => c.left === wall) !== undefined ? this.cornerWidth : 0;

        if (direction === Direction.TO_RIGHT)
            return corners.find(c => c.right === wall) !== undefined ? this.cornerWidth : 0;

        return 0;
    }

    private indexOffset(wallName:string, direction:Direction, corners: Corner[]) {
        return (index) => {
            if (index === 0) return 0;
            return (Direction.signum(direction) * ((index - 1) * this.slotWidth + this.calcCornerOffset(wallName, direction, corners)));
        }
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