export class MouseTracker {
    constructor() {
        this.xy = new THREE.Vector2(0, 0);
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
        window.addEventListener('mousemove', onMouseMove, false);
    }
}