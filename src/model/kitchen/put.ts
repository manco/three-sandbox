import {Direction} from "./Settler";
import {Wall} from "./kitchen";
import {Module} from "../modules/module";

export abstract class Put {
    constructor(
        protected readonly slotWidth:number,
        public readonly wall: Wall, //should be passed in 'execute' method
        public readonly offset,
        public readonly direction,
        public readonly module: Module
    ) {}

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
        slotWidth:number,
        wall: Wall,
        direction: Direction,
        module: Module
    ) {
        super(slotWidth, wall, 0, direction, module);
    }

    _tY() { return -this.slotWidth/2; }

    _tX() {
        return 0;
    }

}
export class PutModule extends Put {
    _tY() { return -this.module.depth/2; }

    _tX() {
        //approx 0 if not resized
        return Direction.signum(this.direction) * (this.module.width - this.slotWidth) / 2;
    }
}