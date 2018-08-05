import {Vector2} from "three";

export class MouseTracker {
    private xy: Vector2;
    private canvas: any;
    constructor(canvas) {
        this.xy = new Vector2(0, 0);
        this.canvas = canvas;
    }

    registerMouseMoveListener() {
        const that = this;
        function onMouseMove(event) {
            const rect = that.canvas.getBoundingClientRect();
            const relX = event.clientX - rect.left;
            const relY = event.clientY - rect.top;

            that.xy.x = relX / that.canvas.clientWidth *  2 - 1;
            that.xy.y = relY / that.canvas.clientHeight * -2 + 1;
        }
        this.canvas.addEventListener('mousemove', onMouseMove, false);
    }
}