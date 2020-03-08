import {Direction} from "./Settler";
import {Wall} from "./kitchen";
import {Module} from "../modules/module";
import {Mesh} from "three";
import {Obstacle} from "./obstacle";

export abstract class Put {
    protected constructor(
        public readonly wall: Wall //should be passed in 'execute' method
    ) {}
    tX():number {
        return this._tX();
    }
    tY():number {
        return -this.wall.depth + this._tY();
    }
    protected abstract _tX():number;
    protected abstract _tY():number;
    abstract mesh:Mesh;
}

export class PutObstacle extends Put {
    constructor(
        wall:Wall,
        private readonly obstacle: Obstacle,
    ) {
        super(wall);
    }
    public readonly mesh = this.obstacle.mesh;
    _tX(): number {
        return this.wall.depth +
            this.obstacle.placement.distanceToAxis;
           // this.obstacle.placement.width/2;
    }

    _tY(): number {
        return 0;
    }

}

export abstract class PutModule extends Put {
    constructor(
        protected readonly slotWidth:number,
        wall: Wall,
        public readonly offset,
        public readonly direction,
        public readonly module: Module
    ) {
        super(wall);
    }

    public readonly mesh = this.module.mesh;

    _tX():number {
        return this.slotWidth/2 +
            this.offset +
            (this.direction === Direction.TO_LEFT ? this.wall.width - this.slotWidth : this.wall.depth) +
            this.__tX();
    }
    _tY():number {
        return this.__tY();
    }
    protected abstract __tX():number;
    protected abstract __tY():number;


}

export class PutCorner extends PutModule {

    constructor(
        slotWidth:number,
        wall: Wall,
        direction: Direction,
        module: Module
    ) {
        super(slotWidth, wall, 0, direction, module);
    }

    __tX() { return 0; }

    __tY() { return -this.slotWidth/2; }
}
export class PutFurniture extends PutModule {
    __tX() {
        //approx 0 if not resized
        return Direction.signum(this.direction) * (this.module.width - this.slotWidth) / 2;
    }
    __tY() { return -this.module.depth/2; }
}