import {Vector2} from "three";

export class MouseTracker {
    private _xy: Vector2 = new Vector2(0, 0);
    constructor(private readonly canvas: HTMLCanvasElement) {}

    public xy() { return this._xy };

    registerMouseMoveListener(): void {
        const onMouseMove = (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const relX = event.clientX - rect.left;
            const relY = event.clientY - rect.top;

            this._xy.x = relX / this.canvas.clientWidth *  2 - 1;
            this._xy.y = relY / this.canvas.clientHeight * -2 + 1;
        };
        this.canvas.addEventListener('mousemove', onMouseMove, false);
    }
}