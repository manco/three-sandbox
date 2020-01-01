import {Direction} from "./Settler";
import {Slot} from "./kitchen";

export abstract class Put {
    constructor(
        protected readonly slotWidth:number,
        [wallName, index]:Slot,
        settlement,
        private readonly offset = settlement.modulesOffsetForIndex.get(wallName)(index),
        public readonly direction = settlement.fillDirection.get(wallName)
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
        slot:Slot,
        settlement,
        private readonly module,
    ) {
        super(slotWidth, slot, settlement);
    }

    tY() { return -this.module.depth/2; }

    _tX() {
        return this.module.isResized() ?
            (Direction.signum(this.direction) * (this.module.width - this.slotWidth) / 2) :
            0;
    }
}