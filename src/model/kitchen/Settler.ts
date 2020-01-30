import {Wall} from "./kitchen";
import {WallName} from "./kitchen";
import {Maps} from "../../utils/lang";
import {Put} from "./put";
import {PutCorner} from "./put";
import {PutModule} from "./put";
import {ModuleType} from "../modules/types";
import ModulesFactory from "../modules/modules-factory";
import {ResizeStrategyFactory} from "../modules/resizing";
import {Obstacle} from "./obstacle";

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

export class Settler {

    constructor(
        private readonly moduleLibrary: ModulesFactory,
        private readonly slotWidth:number = moduleLibrary.slotWidth(),
        private readonly cornerWidth:number = moduleLibrary.cornerWidth()
    ) {}

    private _allPuts = new Array<Put>();
    get allPuts() { return this._allPuts };

    findCommandByIndex(index:number) { return this._allPuts[index] }

    settle(types: ModuleType[], walls:Map<WallName, Wall>): void {
        this._allPuts = [];
        const allCorners = this.setupCorners(new Set<WallName>(walls.keys()));
        types.forEach(
            type => {
                Maps.mapValues(walls, wall => {
                    const puts = this.settleWall(type, wall, this.wallCorners(allCorners, wall.name), []);
                    this._allPuts.push(...puts);
                });
            }
        );
    }

    settleWall(type: ModuleType, wall: Wall, corners: Corner[], obstacles: Obstacle[]): Put[] {

        const commands = new Array<Put>();

        const direction = this.goLeftIfCornerOnRight(wall.name, corners);
        const offsetSignum = Direction.signum(direction);

        let startingOffset = offsetSignum * this.calcCornerOffset(wall.name, corners);
        if (direction === Direction.TO_LEFT) {
            commands.push(new PutCorner(this.slotWidth, wall, direction, this.moduleLibrary.createCorner(type)));
        }

        const step = (space:number, offset:number) => {

            if (space <= 0.1) return [];

            const put = new PutModule(
                this.slotWidth, wall, offset, direction,
                this.moduleLibrary.createForType(type, ResizeStrategyFactory.bySpace(space, this.slotWidth))
            );

            const spaceLeft = space - put.module.width;
            const nextOffset = offset + (offsetSignum * put.module.width);

            return [put].concat(step(spaceLeft, nextOffset))
        };

        /*
            return commands.concat wallObstacles.map(o => step(space(wall, corners, o), startingOffset()).reduce(_.concat)
         */

        const wallObstacles = obstacles.filter(o => o.placement.wallName === wall.name);

        // other approach:
        // identify all bounds (corners, obstacles), sort them
        // create list of sector boundaries, map steps over it, put PutObstacle between steps

        //sorted desc

        //corner 0-70, ..., corner 70-floor, if no corner then floor-floor
        const bounds = this.computeBounds(wall, direction, corners);

        const putsBetweenBounds:Put[][] = [];
        for (let i = 0; i+1 < bounds.length; i++) {
            const current = bounds[i];
            const next = bounds[i+1];

            const offset = current.left;
            const space = Math.abs(next.right - offset);

            putsBetweenBounds[i] = step(space, offset);
        }
        //PutObstacle inbetween somehow?

        return commands.concat(...putsBetweenBounds)
    }

    computeBounds(wall: Wall, direction: Direction, corners: Corner[]) {
        const bounds: Array<{ left, right }> = [
            {
                left: this.hasCornerOnLeft(wall.name, corners) || this.hasCornerOnRight(wall.name, corners) ? this.cornerWidth : 0,
                right: 0
            },
            {
                left: -wall.floorWidth,
                right: -wall.floorWidth + (
                    direction === Direction.TO_LEFT && this.hasCornerOnLeft(wall.name, corners) ? this.cornerWidth :
                        direction === Direction.TO_RIGHT && this.hasCornerOnRight(wall.name, corners) ? this.cornerWidth :
                            0
                )
            }
        ];
        if (bounds.length <2) throw "bounds computed erronously, less than 2 bounds";
        return bounds;
    }

    private spaceForModules(wall:Wall, corners:Corner[], obstacle: Obstacle) {
        return wall.floorWidth - corners.length * this.cornerWidth;
    }

    private wallCorners(corners: Corner[], wallName: WallName): Corner[] {
        return corners.filter(c => c.contains(wallName));
    }

    private goLeftIfCornerOnRight(wall: WallName, corners: Corner[]): Direction {
        return this.hasCornerOnRight(wall, corners) ? Direction.TO_LEFT : Direction.TO_RIGHT;
    }

    private hasCornerOnRight(wall: WallName, corners: Corner[]) {
        return corners.find(c => c.left === wall) !== undefined;
    }

    private hasCornerOnLeft(wallName: WallName, corners: Corner[]) {
        return corners.find(c => c.right === wallName) !== undefined;
    }

    private calcCornerOffset(wall: WallName, corners: Corner[]) {
        if (this.hasCornerOnRight(wall, corners) || this.hasCornerOnLeft(wall, corners))
            return this.cornerWidth;
        else
            return 0;
    }

    private setupCorners(walls:Set<WallName>) {
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