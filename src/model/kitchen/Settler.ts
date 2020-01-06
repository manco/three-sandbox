import {Wall} from "./kitchen";
import {WallName} from "./kitchen";
import {Maps} from "../../utils/lang";
import {Put} from "./put";
import {PutCorner} from "./put";
import {PutModule} from "./put";
import {PutResized} from "./put";
import {ModuleType} from "../modules/types";
import ModulesFactory from "../modules/modules-factory";
import {ResizeBlende} from "../modules/resizing";

export enum Direction {
    TO_LEFT = "TO_LEFT", TO_RIGHT = "TO_RIGHT"
}
export namespace Direction {
    export const signum = (direction: Direction) => direction === Direction.TO_LEFT ? -1 : 1;
}
export class Corner {
    constructor(public readonly left:WallName, public readonly right:WallName) {}

    contains(wall: WallName) {
        return this.left === wall || this.right === wall;
    }
}
export class Settlement {
    constructor(
        public readonly forWalls: Map<string, WallSettlement>
    ) {}
}

export class WallSettlement {
    constructor(
        public readonly fillDirection: Direction,
        public readonly modulesOffsetForIndex: (index:number) => number
    ) {}
}

export class Settler {

    constructor(
        private readonly moduleLibrary: ModulesFactory,
        private readonly slotWidth:number = moduleLibrary.slotWidth(),
        private readonly cornerWidth:number = moduleLibrary.cornerWidth()
    ) {}

    //TODO moduleType is a smell here
    settle2(type: ModuleType, walls:Map<WallName, Wall>): Map<WallName, Put[]> {
        return Maps.mapValues(walls, wall => this.settleWall(type, wall, this.setupCorners(walls)))
    }

    //maybe not all corners needed
    private settleWall(type: ModuleType, wall: Wall, corners: Corner[]): Put[] {

        const commands = new Array<Put>();

        const direction = this.goLeftIfCornerOnRight(wall.name, corners);
        const offsetSignum = Direction.signum(direction);


        let startingOffset = offsetSignum * this.calcCornerOffset(wall.name, direction, corners);
        if (this.findCornerOnLeft(wall.name, corners) !== undefined) {
            commands.push(new PutCorner(this.moduleLibrary, wall, direction, type));
        }

        const step = (space:number, offset:number) => {
            const spaceLeft = space - this.slotWidth;
            const nextOffset = offset + (offsetSignum * this.slotWidth);
            // console.log(`${spaceLeft}, ${nextOffset}`);
            if (spaceLeft > 0) {
                return [this.putModuleOrExpansion(spaceLeft, wall, offset, direction, type)].concat(step(spaceLeft, nextOffset));
            } else {
                return [new PutResized(this.moduleLibrary, wall, offset, direction, type, new ResizeBlende(space))];
            }
        };

        return commands.concat(step(this.spaceForModules(wall, corners), startingOffset));
    }

    //TODO doesnt work quite well?
    private putModuleOrExpansion(spaceLeft: number, wall: Wall, offset: number, direction: Direction, type: ModuleType): PutModule {
        // const nextHole = spaceLeft - this.slotWidth;
        // if (ResizeStrategyFactory.shouldExpand(nextHole))
        //     return new PutResized(this.moduleLibrary, offset, direction, type, new ResizeExpansion(nextHole));
        // else
            return new PutModule(this.moduleLibrary, wall, offset, direction, type);
    }

    private spaceForModules(wall:Wall, corners:Corner[]) {
        return wall.floorWidth - this.wallCorners(corners, wall).length * this.cornerWidth;
    }

    private wallCorners(corners: Corner[], wall: Wall) {
        return corners.filter(c => c.contains(wall.name));
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

    private indexOffset(wallName:WallName, direction:Direction, corners: Corner[]) {
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