import {Direction} from "./Settler";
import ModulesFactory from "../modules/modules-factory";
import {ModuleType} from "../modules/types";
import {ResizeStrategy} from "../modules/resizing";
import {Wall} from "./kitchen";

export abstract class Put {
    protected constructor(
        protected readonly moduleLibrary:ModulesFactory,
        public readonly wall: Wall,
        private readonly offset,
        public readonly direction
    ) {}

    public abstract readonly module;

    tX():number {
        return this.moduleLibrary.slotWidth()/2 + this.offset + this._tX();
    }
    abstract tY():number;
    abstract _tX():number;


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

    tY() { return -this.moduleLibrary.slotWidth()/2; }

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

    tY() { return -this.module.depth/2; } //maybe same as for corner?

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
        return Direction.signum(this.direction) * (this.module.width - this.moduleLibrary.slotWidth()) / 2;
    }
}