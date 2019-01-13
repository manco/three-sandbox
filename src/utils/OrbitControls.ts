import {Vector3} from "three";
import {Spherical} from "three";
import {Vector2} from "three";
import {MOUSE} from "three";
import {OrthographicCamera} from "three";
import {PerspectiveCamera} from "three";
import {EventDispatcher} from "three";
import {Quaternion} from "three";
import {MouseMode} from "../controller/controls";

// This set of controls performs orbiting, dollying (zooming), and panning.
// Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
//
//    Orbit - left mouse / touch: one-finger move
//    Zoom - middle mouse, or mousewheel / touch: two-finger spread or squish
//    Pan - right mouse, or left mouse + ctrl/metaKey, or arrow keys / touch: two-finger move

export class OrbitControls extends EventDispatcher {

    // "target" sets the location of focus, where the object orbits around
    target = new Vector3();

    // How far you can dolly in and out ( PerspectiveCamera only )
    private minDistance = 0;
    private maxDistance = Infinity;

    // How far you can zoom in and out ( OrthographicCamera only )
    private minZoom = 0;
    private maxZoom = Infinity;

    // How far you can orbit vertically, upper and lower limits.
    // Range is 0 to Math.PI radians.
    private minPolarAngle = 0; // radians
    private maxPolarAngle = Math.PI /2; // radians

    // How far you can orbit horizontally, upper and lower limits.
    // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
    private minAzimuthAngle = - Infinity; // radians
    private maxAzimuthAngle = Infinity; // radians

    private zoomSpeed = 1.0;
    private rotateSpeed = 1.0;
    private panSpeed = 1.0;
    private screenSpacePanning = false; // if true, pan in screen-space
    private keyPanSpeed = 7.0;	// pixels moved per arrow key push

    // The four arrow keys
    private static keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

    // Mouse buttons
    private static mouseButtons = { LEFT: MOUSE.LEFT, MIDDLE: MOUSE.MIDDLE, RIGHT: MOUSE.RIGHT };

    // for reset
    private target0 = this.target.clone();
    private position0 = this.object.position.clone();
    private zoom0 = this.object.zoom;

    private changeEvent = { type: 'change' };
    private startEvent = { type: 'start' };
    private endEvent = { type: 'end' };

    private static STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };

    private state = OrbitControls.STATE.NONE;

    private EPS = 0.000001;

    // current position in spherical coordinates
    private spherical = new Spherical();
    private sphericalDelta = new Spherical();

    private scale = 1;
    private panOffset = new Vector3();
    private zoomChanged = false;

    private rotateStart = new Vector2();
    private rotateEnd = new Vector2();
    private rotateDelta = new Vector2();

    private panStart = new Vector2();
    private panEnd = new Vector2();
    private panDelta = new Vector2();

    private dollyStart = new Vector2();
    private dollyEnd = new Vector2();
    private dollyDelta = new Vector2();
    public mouseMode: MouseMode = MouseMode.NONE;

	constructor( private readonly object: OrthographicCamera | PerspectiveCamera, private readonly domElement:HTMLCanvasElement ) {
		super();

        this.domElement.addEventListener( 'contextmenu', e => this.onContextMenu(e), false );
        this.domElement.addEventListener( 'mousedown', e => this.onMouseDown(e), false );
        this.domElement.addEventListener( 'wheel', e => this.onMouseWheel(e), false );
        this.domElement.addEventListener( 'touchstart', e => this.onTouchStart(e), false );
        this.domElement.addEventListener( 'touchend', e => this.onTouchEnd(e), false );
        this.domElement.addEventListener( 'touchmove', e => this.onTouchMove(e), false );

        window.addEventListener( 'keydown', e => this.onKeyDown(e), false );

        // force an update at start

        this.update();
	}

    update(): boolean {

        const offset = new Vector3();

        // so camera.up is the orbit axis
        const quat = new Quaternion().setFromUnitVectors(this.object.up, new Vector3(0, 1, 0));
        const quatInverse = quat.clone().inverse();

        const lastPosition = new Vector3();
        const lastQuaternion = new Quaternion();

        const f = () => {

            const position = this.object.position;

            offset.copy(position).sub(this.target);

            // rotate offset to "y-axis-is-up" space
            offset.applyQuaternion(quat);

            // angle from z-axis around y-axis
            this.spherical.setFromVector3(offset);

            this.spherical.theta += this.sphericalDelta.theta;
            this.spherical.phi += this.sphericalDelta.phi;

            // restrict theta to be between desired limits
            this.spherical.theta = Math.max(this.minAzimuthAngle, Math.min(this.maxAzimuthAngle, this.spherical.theta));

            // restrict phi to be between desired limits
            this.spherical.phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, this.spherical.phi));

            this.spherical.makeSafe();


            this.spherical.radius *= this.scale;

            // restrict radius to be between desired limits
            this.spherical.radius = Math.max(this.minDistance, Math.min(this.maxDistance, this.spherical.radius));

            // move target to panned location
            this.target.add(this.panOffset);

            offset.setFromSpherical(this.spherical);

            // rotate offset back to "camera-up-vector-is-up" space
            offset.applyQuaternion(quatInverse);

            position.copy(this.target).add(offset);

            this.object.lookAt(this.target);

            this.sphericalDelta.set(0, 0, 0);
            this.panOffset.set(0, 0, 0);

            this.scale = 1;

            // update condition is:
            // min(camera displacement, camera rotation in radians)^2 > EPS
            // using small-angle approximation cos(x/2) = 1 - x^2 / 8

            if (this.zoomChanged ||
                lastPosition.distanceToSquared(this.object.position) > this.EPS ||
                8 * (1 - lastQuaternion.dot(this.object.quaternion)) > this.EPS) {

                this.dispatchEvent(this.changeEvent);

                lastPosition.copy(this.object.position);
                lastQuaternion.copy(this.object.quaternion);
                this.zoomChanged = false;
                return true;
            }
            return false;
        };
        return f();
    }

    dispose() {

        this.domElement.removeEventListener( 'contextmenu', e => this.onContextMenu(e), false );
        this.domElement.removeEventListener( 'mousedown', e => this.onMouseDown(e), false );
        this.domElement.removeEventListener( 'wheel', e => this.onMouseWheel(e), false );
        this.domElement.removeEventListener( 'touchstart', e => this.onTouchStart(e), false );
        this.domElement.removeEventListener( 'touchend', e => this.onTouchEnd(e), false );
        this.domElement.removeEventListener( 'touchmove', e => this.onTouchMove(e), false );
        document.removeEventListener( 'mousemove', e => this.onMouseMove(e), false );
        document.removeEventListener( 'mouseup', e => this.onMouseUp(e), false );
        window.removeEventListener( 'keydown', e => this.onKeyDown(e), false );

        //scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

    };

    saveState() {
        this.target0.copy( this.target );
        this.position0.copy( this.object.position );
        this.zoom0 = this.object.zoom;
    };

    reset() {
        this.target.copy( this.target0 );
        this.object.position.copy( this.position0 );
        this.object.zoom = this.zoom0;

        this.object.updateProjectionMatrix();
        this.dispatchEvent( this.changeEvent );

        this.update();

        this.state = OrbitControls.STATE.NONE;

    };

    getZoomScale() {
        return Math.pow( 0.95, this.zoomSpeed );
    }

    rotateLeft(angle:number) {
        this.sphericalDelta.theta -= angle;
    };

    rotateUp( angle:number ) {
        this.sphericalDelta.phi -= angle;
    };

    private panLeft( distance ) {

        const v = new Vector3();

		v.setFromMatrixColumn( this.object.matrix, 0 ); // get X column of objectMatrix
		v.multiplyScalar( - distance );
		this.panOffset.add( v );
    };

    private panUp( distance ) {

        const v = new Vector3();
		if ( this.screenSpacePanning === true ) {
			v.setFromMatrixColumn( this.object.matrix, 1 );
		} else {
			v.setFromMatrixColumn( this.object.matrix, 0 );
			v.crossVectors( this.object.up, v );
		}
		v.multiplyScalar( distance );
		this.panOffset.add( v );
	}

    // deltaX and deltaY are in pixels; right and down are positive
	pan( deltaX, deltaY ) {

        const offset = new Vector3();

            const element = this.domElement;
			const asPerspectiveCam = this.object as PerspectiveCamera;
        	const asOrthographicCam = this.object as OrthographicCamera;
            if ( asPerspectiveCam.isPerspectiveCamera ) {

                const position = this.object.position;
                offset.copy( position ).sub( this.target );

                // half of the fov is center to top of screen
                const targetDistance = offset.length() * Math.tan( ( asPerspectiveCam.fov / 2 ) * Math.PI / 180.0 );

                // we use only clientHeight here so aspect ratio does not distort speed
                this.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
                this.panUp( 2 * deltaY * targetDistance / element.clientHeight );

            } else if ( asOrthographicCam.isOrthographicCamera ) {

                this.panLeft( deltaX * ( asOrthographicCam.right - asOrthographicCam.left ) / this.object.zoom / element.clientWidth );
                this.panUp( deltaY * ( asOrthographicCam.top - asOrthographicCam.bottom ) / this.object.zoom / element.clientHeight );

            } else {

                // camera neither orthographic nor perspective
                console.warn('WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.');
            }
    }

    dollyIn( dollyScale ) {

        const asPerspectiveCam = this.object as PerspectiveCamera;
        const asOrthographicCam = this.object as OrthographicCamera;
        if ( asPerspectiveCam.isPerspectiveCamera ) {
            this.scale /= dollyScale;
        } else if ( asOrthographicCam.isOrthographicCamera ) {
            this.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;
        } else {
            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
        }

    }

    dollyOut( dollyScale ) {

        const asPerspectiveCam = this.object as PerspectiveCamera;
        const asOrthographicCam = this.object as OrthographicCamera;
        if ( asPerspectiveCam.isPerspectiveCamera ) {
            this.scale *= dollyScale;
        } else if ( asOrthographicCam.isOrthographicCamera ) {
            this.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom / dollyScale ) );
            this.object.updateProjectionMatrix();
            this.zoomChanged = true;
        } else {
            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
        }
    }

    handleMouseDownRotate( event ) {
        this.rotateStart.set( event.clientX, event.clientY );
    }

    handleMouseDownDolly( event ) {
        this.dollyStart.set( event.clientX, event.clientY );
    }

    handleMouseDownPan( event ) {
        this.panStart.set( event.clientX, event.clientY );
    }

    handleMouseMoveRotate( event ) {
        this.rotateEnd.set( event.clientX, event.clientY );
        this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart ).multiplyScalar( this.rotateSpeed );
        const element = this.domElement;
        this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientHeight ); // yes, height
        this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight );
        this.rotateStart.copy( this.rotateEnd );
        this.update();
    }

    handleMouseMoveDolly( event ) {
        this.dollyEnd.set( event.clientX, event.clientY );
        this.dollyDelta.subVectors( this.dollyEnd, this.dollyStart );
        if ( this.dollyDelta.y > 0 ) {
            this.dollyIn( this.getZoomScale() );
        } else if ( this.dollyDelta.y < 0 ) {
            this.dollyOut( this.getZoomScale() );
        }
        this.dollyStart.copy( this.dollyEnd );
        this.update();
    }

    handleMouseMovePan( event ) {
        this.panEnd.set( event.clientX, event.clientY );
        this.panDelta.subVectors( this.panEnd, this.panStart ).multiplyScalar( this.panSpeed );
        this.pan( this.panDelta.x, this.panDelta.y );
        this.panStart.copy( this.panEnd );
        this.update();
    }

    handleMouseWheel( event ) {
        if ( event.deltaY < 0 ) {
            this.dollyOut( this.getZoomScale() );
        } else if ( event.deltaY > 0 ) {
            this.dollyIn( this.getZoomScale() );
        }
        this.update();
    }

    handleKeyDown( event ) {
        switch ( event.keyCode ) {
            case OrbitControls.keys.UP:
                this.pan( 0, this.keyPanSpeed );
                this.update();
                break;
            case OrbitControls.keys.BOTTOM:
                this.pan( 0, - this.keyPanSpeed );
                this.update();
                break;
            case OrbitControls.keys.LEFT:
                this.pan( this.keyPanSpeed, 0 );
                this.update();
                break;
            case OrbitControls.keys.RIGHT:
                this.pan( - this.keyPanSpeed, 0 );
                this.update();
                break;
        }
    }

    handleTouchStartRotate( event ) {
        this.rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
    }

    handleTouchStartDollyPan( event ) {
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        this.dollyStart.set( 0, distance );

        const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        this.panStart.set( x, y );

    }

    handleTouchMoveRotate( event ) {
        this.rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

        this.rotateDelta.subVectors( this.rotateEnd, this.rotateStart ).multiplyScalar( this.rotateSpeed );

        const element = this.domElement;

        this.rotateLeft( 2 * Math.PI * this.rotateDelta.x / element.clientHeight ); // yes, height

        this.rotateUp( 2 * Math.PI * this.rotateDelta.y / element.clientHeight );

        this.rotateStart.copy( this.rotateEnd );

        this.update();

    }

    handleTouchMoveDollyPan( event ) {
        const dx = event.touches[0].pageX - event.touches[1].pageX;
        const dy = event.touches[0].pageY - event.touches[1].pageY;

        const distance = Math.sqrt(dx * dx + dy * dy);

        this.dollyEnd.set( 0, distance );

        this.dollyDelta.set( 0, Math.pow( this.dollyEnd.y / this.dollyStart.y, this.zoomSpeed ) );

        this.dollyIn( this.dollyDelta.y );

        this.dollyStart.copy( this.dollyEnd );

        const x = 0.5 * (event.touches[0].pageX + event.touches[1].pageX);
        const y = 0.5 * (event.touches[0].pageY + event.touches[1].pageY);

        this.panEnd.set( x, y );

        this.panDelta.subVectors( this.panEnd, this.panStart ).multiplyScalar( this.panSpeed );

        this.pan( this.panDelta.x, this.panDelta.y );

        this.panStart.copy( this.panEnd );

        this.update();

    }

    //
    // event handlers - FSM: listen for events and reset state
    //

    onMouseDown( event ) {

        event.preventDefault();

        switch ( event.button ) {

            case OrbitControls.mouseButtons.LEFT:

                // if ( event.ctrlKey || event.metaKey ) {
                if (this.mouseMode === MouseMode.PAN_ONLY) {
                    this.handleMouseDownPan( event );
                    this.state = OrbitControls.STATE.PAN;
                }
                if (this.mouseMode === MouseMode.ROTATE_ONLY) {
                    this.handleMouseDownRotate( event );
                    this.state = OrbitControls.STATE.ROTATE;
                }

                break;

            // case OrbitControls.mouseButtons.MIDDLE:
            //
            //     this.handleMouseDownDolly( event );
            //
            //     this.state = OrbitControls.STATE.DOLLY;
            //
            //     break;
            //
            // case OrbitControls.mouseButtons.RIGHT:
            //     this.handleMouseDownPan( event );
            //
            //     this.state = OrbitControls.STATE.PAN;
            //
            //     break;

        }

        if ( this.state !== OrbitControls.STATE.NONE ) {

            document.addEventListener( 'mousemove', e => this.onMouseMove(e), false );
            document.addEventListener( 'mouseup', e => this.onMouseUp(e), false );

            this.dispatchEvent( this.startEvent );

        }

    }

    onMouseMove( event ) {
        event.preventDefault();

        switch ( this.state ) {

            case OrbitControls.STATE.ROTATE:
                this.handleMouseMoveRotate( event );

                break;

            case OrbitControls.STATE.DOLLY:
                this.handleMouseMoveDolly( event );

                break;

            case OrbitControls.STATE.PAN:
                this.handleMouseMovePan( event );

                break;

        }

    }

    onMouseUp( event ) {

        document.removeEventListener( 'mousemove', e => this.onMouseMove(e), false );
        document.removeEventListener( 'mouseup', e => this.onMouseUp(e), false );

        this.dispatchEvent( this.endEvent );

        this.state = OrbitControls.STATE.NONE;

    }

    onMouseWheel( event ) {

        if ( ( this.state !== OrbitControls.STATE.NONE && this.state !== OrbitControls.STATE.ROTATE ) ) return;

        event.preventDefault();
        event.stopPropagation();

        this.dispatchEvent( this.startEvent );

        this.handleMouseWheel( event );

        this.dispatchEvent( this.endEvent );

    }

    onKeyDown( event ) {
        this.handleKeyDown( event );
    }

    onTouchStart( event ) {
        event.preventDefault();
        switch ( event.touches.length ) {
            case 1:	// one-fingered touch: rotate
                this.handleTouchStartRotate( event );
                this.state = OrbitControls.STATE.TOUCH_ROTATE;
                break;
            case 2:	// two-fingered touch: dolly-pan
                this.handleTouchStartDollyPan( event );
                this.state = OrbitControls.STATE.TOUCH_DOLLY_PAN;
                break;
            default:
                this.state = OrbitControls.STATE.NONE;
        }
        if ( this.state !== OrbitControls.STATE.NONE ) {
            this.dispatchEvent( this.startEvent );
        }
    }

    onTouchMove( event ) {
        event.preventDefault();
        event.stopPropagation();

        switch ( event.touches.length ) {

            case 1: // one-fingered touch: rotate
                if ( this.state !== OrbitControls.STATE.TOUCH_ROTATE ) return; // is this needed?
                this.handleTouchMoveRotate( event );
                break;

            case 2: // two-fingered touch: dolly-pan
                if ( this.state !== OrbitControls.STATE.TOUCH_DOLLY_PAN ) return; // is this needed?
                this.handleTouchMoveDollyPan( event );
                break;

            default:
                this.state = OrbitControls.STATE.NONE;
        }

    }

    onTouchEnd( event ) {
        this.dispatchEvent( this.endEvent );
        this.state = OrbitControls.STATE.NONE;
    }

    onContextMenu( event ) {
        event.preventDefault();
    }
}