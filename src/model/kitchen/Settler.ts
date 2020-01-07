import {Wall} from "./kitchen";
import {WallName} from "./kitchen";
import {Maps} from "../../utils/lang";
import {Put} from "./put";
import {PutCorner} from "./put";
import {ModuleType} from "../modules/types";
import ModulesFactory from "../modules/modules-factory";
import {ResizeStrategyFactory} from "../modules/resizing";
import {PutModule} from "./put";

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
        types.forEach(
            type => {
                const allCorners = this.setupCorners(walls);
                Maps.mapValues(walls, wall => {
                    const puts = this.settleWall(type, wall, this.wallCorners(allCorners, wall));
                    this._allPuts.push(...puts);
                });
            }
        );
    }

    //maybe not all corners needed
    private settleWall(type: ModuleType, wall: Wall, corners: Corner[]): Put[] {

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

        return commands.concat(step(this.spaceForModules(wall, corners), startingOffset));
    }

    private spaceForModules(wall:Wall, corners:Corner[]) {
        return wall.floorWidth - corners.length * this.cornerWidth;
    }

    private wallCorners(corners: Corner[], wall: Wall) {
        return corners.filter(c => c.contains(wall.name));
    }

    private goLeftIfCornerOnRight(wall: WallName, corners: Corner[]): Direction {
        return this.hasCornerOnRight(wall, corners) ? Direction.TO_LEFT : Direction.TO_RIGHT;
    }

    private hasCornerOnRight(wall: WallName, corners: Corner[]) {
        return corners.find(c => c.left === wall) !== undefined;
    }

    private calcCornerOffset(wall: WallName, corners: Corner[]) {
        if (this.hasCornerOnRight(wall, corners) || corners.find(c => c.right === wall) !== undefined)
            return this.cornerWidth;
        else
            return 0;
    }

    private setupCorners(walls:Map<WallName, Wall>) {
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