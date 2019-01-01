import {Coords} from "./lang";

export class MouseTracker {
    private readonly _xy: Coords = { x:0, y:0 };
    constructor(canvas: HTMLCanvasElement) {
        const onMouseMove = (event) => {
            const rect = canvas.getBoundingClientRect();
            const relX = event.clientX - rect.left;
            const relY = event.clientY - rect.top;

            this._xy.x = relX / canvas.clientWidth * 2 - 1;
            this._xy.y = relY / canvas.clientHeight * -2 + 1;
        };
        canvas.addEventListener('mousemove', onMouseMove, false);
    }

    public xy():Coords {
        return this._xy;
    }
}