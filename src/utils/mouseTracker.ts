import {Vector2} from "three";

export class MouseTracker {
    xy: Vector2 = new Vector2(0, 0); //TODO private setter
    constructor(private readonly canvas: HTMLCanvasElement) {}

    registerMouseMoveListener(): void {
        const onMouseMove = (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const relX = event.clientX - rect.left;
            const relY = event.clientY - rect.top;

            this.xy.x = relX / this.canvas.clientWidth *  2 - 1;
            this.xy.y = relY / this.canvas.clientHeight * -2 + 1;
        };
        this.canvas.addEventListener('mousemove', onMouseMove, false);
    }
}