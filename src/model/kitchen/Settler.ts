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

type Bound = { from, to };

export class Settler {

    constructor(
        private readonly moduleLibrary: ModulesFactory,
        private readonly slotWidth:number = moduleLibrary.slotWidth(),
        private readonly cornerWidth:number = moduleLibrary.cornerWidth()
    ) {}

    private _allPuts = new Array<Put>();
    get allPuts() { return this._allPuts };

    findCommandByIndex(index:number) { return this._allPuts[index] }

    settle(types: ModuleType[], walls:Map<WallName, Wall>, obstacles: Obstacle[]): void {
        this._allPuts = [];
        const allCorners = this.setupCorners(new Set<WallName>(walls.keys()));
        types.forEach(
            type => {
                Maps.mapValues(walls, wall => {
                    const puts = this.settleWall(type, wall, this.wallCorners(allCorners, wall.name), obstacles);
                    this._allPuts.push(...puts);
                });
            }
        );
    }

    settleWall(type: ModuleType, wall: Wall, corners: Corner[], obstacles: Obstacle[]): Put[] {

        const commands = new Array<Put>();

        const direction = this.goLeftIfCornerOnRight(wall.name, corners);
        const offsetSignum = Direction.signum(direction);

        if (direction === Direction.TO_LEFT) {
            commands.push(new PutCorner(this.slotWidth, wall, direction, this.moduleLibrary.createCorner(type)));
        }

        const step = (space:number, offset:number) => {
            console.log(`step: space=${space}, offset=${offset}`);
            if (space <= 0.1) return [];

            const put = new PutModule(
                this.slotWidth, wall, offset, direction,
                this.moduleLibrary.createForType(type, ResizeStrategyFactory.bySpace(space, this.slotWidth))
            );

            const spaceLeft = space - put.module.width;
            if (isNaN(spaceLeft)) console.log(`wtf: moduleWIdth=${put.module.width}`);

            const nextOffset = offset + (offsetSignum * put.module.width);

            return [put].concat(step(spaceLeft, nextOffset))
        };

        const wallObstacles = obstacles.filter(o => o.placement.wallName === wall.name);

        // other approach:
        // identify all bounds (corners, obstacles), sort them
        // create list of sector boundaries, map steps over it, put PutObstacle between steps

        const bounds = this.computeBounds(wall, corners, wallObstacles);

        const putsBetweenBounds:Put[][] = [];
        for (let i = 0; i+1 < bounds.length; i++) {
            const current = bounds[i];
            const next = bounds[i+1];

            const offset = current.to;
            const space = Math.abs(next.from - offset);

            putsBetweenBounds[i] = step(space, offsetSignum * offset);
        }
        //PutObstacle inbetween somehow?

        return commands.concat(...putsBetweenBounds)
    }

    computeBounds(wall: Wall, corners: Corner[], obstacles: Obstacle[]) {

        const bounds: Array<Bound> = [
            {
                from: 0,
                to: (corners.length > 0) ? this.cornerWidth : 0
            },
            {
                from: (corners.length > 1) ? wall.floorWidth - this.cornerWidth : wall.floorWidth,
                to: wall.floorWidth
            }
        ];

        bounds.push(...obstacles.map(o => { return { from: o.placement.distanceToRightEdge(), to: o.placement.distanceToLeftEdge()}}));
        bounds.sort((a:Bound, b:Bound) => a.to - b.to); //ascending!

        if (bounds.length <2) throw "bounds computed erronously, less than 2 bounds";
        return bounds;
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