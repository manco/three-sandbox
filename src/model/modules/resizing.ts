import {Module} from "./module";

export abstract class ResizeStrategy {
    protected constructor(
        public readonly reason: ResizeReason,
        private readonly toSize: number,
        private readonly constFactor: number
    ) {}

    applyOn(module: Module) {
        module.mesh.geometry.scale(this.constFactor + this.toSize / module.width, 1, 1);
        module.mesh.geometry.computeBoundingBox();
    }
}

export enum ResizeReason {
    NOOP = "NOOP", EXPANSION = "EXPANSION", BLENDE = "BLENDE"
}

export class ResizeExpansion extends ResizeStrategy {
    constructor(toSize: number) {
        super(ResizeReason.EXPANSION, toSize, 1);
    }

}
export class ResizeBlende extends ResizeStrategy {
    constructor(toSize: number) {
        super(ResizeReason.BLENDE, toSize, 0);
    }
}

export class NoResize extends ResizeStrategy {
    constructor() {
        super(ResizeReason.NOOP, 0, 0);
    }
    applyOn(module: Module) { }
}

export class ResizeStrategyFactory {

    static readonly NOOP = new NoResize();

    static bySpace(space:number, slotWidth:number) {
        if (space > slotWidth + 20) return ResizeStrategyFactory.NOOP;
        if (space > slotWidth) return new ResizeExpansion(space - slotWidth);
        return new ResizeBlende(space);
    }
}