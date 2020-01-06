import {Direction} from "./Settler";
import ModulesFactory from "../modules/modules-factory";
import {ModuleType} from "../modules/types";
import {ResizeStrategy} from "../modules/resizing";
import {Wall} from "./kitchen";

export abstract class Put {
    protected constructor(
        protected readonly moduleLibrary:ModulesFactory,
        public readonly wall: Wall, //should be passed in 'execute' method
        private readonly offset,
        protected readonly direction
    ) {}

    public abstract readonly module;
    protected readonly slotWidth = this.moduleLibrary.slotWidth();

    tX():number {
        return this.slotWidth/2 +
            this.offset +
            (this.direction === Direction.TO_LEFT ? this.wall.width - this.slotWidth : this.wall.depth) +
            this._tX();
    }
    tY():number {
        return -this.wall.depth + this._tY();
    }
    abstract _tX():number;
    abstract _tY():number;


}
export class PutCorner extends Put {

    constructor(
        moduleLibrary:ModulesFactory,
        wall: Wall,
        direction: Direction,
        type: ModuleType
    ) {
        super(moduleLibrary, wall, 0, direction);
        this.module = moduleLibrary.createCorner(type);
    }

    public readonly module;

    _tY() { return -this.slotWidth/2; }

    _tX() {
        return 0;
    }

}
export class PutModule extends Put {
    constructor(
        moduleLibrary:ModulesFactory,
        wall: Wall,
        offset:number,
        direction:Direction,
        type:ModuleType
    ) {
        super(
            moduleLibrary,
            wall,
            offset,
            direction
        );
        this.module = moduleLibrary.createForType(type);
    }

    public readonly module;

    _tY() { return -this.module.depth/2; }

    _tX() {
        return 0;
    }
}
export class PutResized extends PutModule {
    constructor(
        moduleLibrary:ModulesFactory,
        wall: Wall,
        offset:number,
        direction:Direction,
        type:ModuleType,
        resize: ResizeStrategy
    ) {
        super(
            moduleLibrary,
            wall,
            offset,
            direction,
            type
        );
        this.module = moduleLibrary.createForType(type, resize);
    }

    public readonly module;

    _tX() {
        return Direction.signum(this.direction) * (this.module.width - this.slotWidth) / 2;
    }
}