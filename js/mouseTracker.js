export class MouseTracker {
    constructor(canvas) {
        this.xy = new THREE.Vector2(0, 0);
        this.canvas = canvas;
    }

    registerMouseMoveListener() {
        const that = this;
        function onMouseMove(event) {
            const rect = canvas.getBoundingClientRect();
            const relX = event.clientX - rect.left;
            const relY = event.clientY - rect.top;

            that.xy.x = relX / canvas.clientWidth *  2 - 1;
            that.xy.y = relY / canvas.clientHeight * -2 + 1;
        }
        this.canvas.addEventListener('mousemove', onMouseMove, false);
    }
}