import {Direction} from "./Settler";
import {WallSettlement} from "./Settler";

export abstract class Put {
    constructor(
        protected readonly slotWidth:number,
        index:number,
        settlement:WallSettlement,
        private readonly offset = settlement.modulesOffsetForIndex(index),
        public readonly direction = settlement.fillDirection
    ) {}

    tX():number {
        return this.slotWidth/2 + this.offset + this._tX();
    }
    abstract tY():number;
    abstract _tX():number;


}
export class PutCorner extends Put {
    tY() { return -this.slotWidth/2; }

    _tX() {
        return 0;
    }

}
export class PutModule extends Put {
    constructor(
        protected readonly slotWidth:number,
        index:number,
        settlement:WallSettlement,
        private readonly module,
    ) {
        super(slotWidth, index, settlement);
    }

    tY() { return -this.module.depth/2; }

    _tX() {
        return this.module.isResized() ?
            (Direction.signum(this.direction) * (this.module.width - this.slotWidth) / 2) :
            0;
    }
}