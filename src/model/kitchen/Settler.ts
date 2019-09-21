import {Wall} from "./kitchen";
import {Maps} from "../../utils/lang";

export class Corner {
    constructor(public left:string, public right:string) {}
}
export class Result {
    constructor(
        public readonly corners:Corner[],
        public readonly modulesCount: Map<string, number>
    ) {}
}

export class Settler {

    private static readonly CornerWidth = 70;
    private static readonly SlotWidth = 60;

    settle(walls:Map<string, Wall>) {

        const corners = this.setupCorners(walls);

        const modulesCount = Maps.mapValues(walls, wall => this.count(wall, corners));
        return new Result(corners, modulesCount);
    };

    private count(wall:Wall, corners:Corner[]) {
        const cornersCount: number = corners.filter(c => c.left === wall.name || c.right === wall.name).length;

        return Math.floor((wall.width - (cornersCount * Settler.CornerWidth)) / Settler.SlotWidth);
    };

    private setupCorners(walls:Map<string, Wall>) {
        const corners = [];

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