import * as THREE from 'three';
let {EventDispatcher}=THREE;

var changeEvent = { type: 'change' };
var startEvent = { type: 'start' };
var endEvent = { type: 'end' };

var STATE = { NONE: - 1, ROTATE: 0, DOLLY: 1, PAN: 2, TOUCH_ROTATE: 3, TOUCH_DOLLY_PAN: 4 };

var state = STATE.NONE;

var EPS = 0.000001;

// current position in spherical coordinates
// 球面坐标中的当前位置
var spherical = new THREE.Spherical();
//横向旋转角度
var sphericalDelta = new THREE.Spherical();

var scale = 1;
var panOffset = new THREE.Vector3();
var zoomChanged = false;

var rotateStart = new THREE.Vector2();
var rotateEnd = new THREE.Vector2();
var rotateDelta = new THREE.Vector2();

var panStart = new THREE.Vector2();
var panEnd = new THREE.Vector2();
var panDelta = new THREE.Vector2();

//滑动
var dollyStart = new THREE.Vector2();
var dollyEnd = new THREE.Vector2();
var dollyDelta = new THREE.Vector2();

var scope;

export default class OrbitControls2 extends EventDispatcher{
    constructor(object, domElement,size=null){
        super();
        scope=this;
        this.object = object;
        this.domElement = ( domElement !== undefined ) ? domElement : document;
        this.size=size;
        // Set to false to disable this control
        // 是否禁用
        this.enabled = true;

        // "target" sets the location of focus, where the object orbits around
        // 轨道环绕的目标点
        this.target = new THREE.Vector3();

        // How far you can dolly in and out ( PerspectiveCamera only )
        // 拉伸极限距离
        this.minDistance = 0;
        this.maxDistance = Infinity;

        // How far you can zoom in and out ( OrthographicCamera only )
        // 正交相机zoom 属性的缩放
        this.minZoom = 0;
        this.maxZoom = Infinity;

        // How far you can orbit vertically, upper and lower limits.
        // Range is 0 to Math.PI radians.
        // 垂直环绕极限
        this.minPolarAngle = 0; // radians
        this.maxPolarAngle = Math.PI; // radians

        // How far you can orbit horizontally, upper and lower limits.
        // If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
        // 水平环绕极限
        this.minAzimuthAngle = - Infinity; // radians
        this.maxAzimuthAngle = Infinity; // radians

        // Set to true to enable damping (inertia)
        // If damping is enabled, you must call controls.update() in your animation loop
        // 是否应用阻尼
        this.enableDamping = false;
        //阻尼惯性，其值越小，越无阻力
        this.dampingFactor = 0.25;

        // This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
        // Set to false to disable zooming
        //是否启用缩放
        this.enableZoom = true;
        //缩放速度
        this.zoomSpeed = 1.0;

        // Set to false to disable rotating
        //是否启用旋转
        this.enableRotate = true;
        //旋转速度
        this.rotateSpeed = 1.0;

        // Set to false to disable panning
        //是否移动
        this.enablePan = true;
        //移动速度
        this.panSpeed = 1.0;
        //基于相机射线的屏幕位移
        this.screenSpacePanning = false; // if true, pan in screen-space
        //箭头位移速度
        this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

        // Set to true to automatically rotate around the target
        // If auto-rotate is enabled, you must call controls.update() in your animation loop
        // 自动旋转
        this.autoRotate = false;
        this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

        // Set to false to disable use of the keys
        // 什么鬼
        this.enableKeys = true;

        // The four arrow keys
        // 箭头
        this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

        // Mouse buttons
        // 鼠标按键
        this.mouseButtons = { LEFT: THREE.MOUSE.LEFT, MIDDLE: THREE.MOUSE.MIDDLE, RIGHT: THREE.MOUSE.RIGHT };

        // for reset
        // 用于重置
        this.target0 = this.target.clone();
        this.position0 = this.object.position.clone();
        this.zoom0 = this.object.zoom;
        
        
        
        this.init();
    }
    init(){
        window.addEventListener( 'keydown', this.onKeyDown, false );
    }
    //
    // public methods
    //
    getPolarAngle(){
        return spherical.phi;
    }
    getAzimuthalAngle(){
        return spherical.theta;
    }
    saveState(){
        this.target0.copy( this.target );
        this.position0.copy( this.object.position );
        this.zoom0 = this.object.zoom;
    }
    reset(){
        this.target.copy( this.target0 );
        this.object.position.copy( this.position0 );
        this.object.zoom = this.zoom0;

        this.object.updateProjectionMatrix();
        this.dispatchEvent( changeEvent );

        this.update();

        state = STATE.NONE;
    }
    update3(){
        this.object.position.add( panOffset );
        panOffset.set( 0, 0, 0 );
    }
    update(){
        var offset = new THREE.Vector3();
        var position = this.object.position;
        //this.target 在每次刷新时都会改变
        //在目标位移之前，获取相机到目标的距离
        offset.copy( position ).sub( this.target );
        //panOffset 是对目标的相对偏移设置，所以在此直接让目标偏移
        this.target.add( panOffset );
        //移动中，相机位和目标位是同步移动的，
        position.copy( this.target ).add( offset );
        this.object.lookAt( this.target );
        //更新完后，位移置空，
        panOffset.set( 0, 0, 0 );
    }
    update2(){
        var offset = new THREE.Vector3();

        // so camera.up is the orbit axis
        //四元素，绕Y 轴旋转
        var quat = new THREE.Quaternion().setFromUnitVectors( this.object.up, new THREE.Vector3( 0, 1, 0 ) );

        //inverse 翻转四元数，
        var quatInverse = quat.clone().inverse();
        //?
        var lastPosition = new THREE.Vector3();
        var lastQuaternion = new THREE.Quaternion();

        //相机位
        var position = this.object.position;
        //相机位减目标位
        offset.copy( position ).sub( this.target );

        // rotate offset to "y-axis-is-up" space
        //偏移应用四元数，移动至此有效
        offset.applyQuaternion( quat );

        // angle from z-axis around y-axis
        //获取一个被三维点撑起的正圆
        spherical.setFromVector3( offset );

        if ( this.autoRotate && state === STATE.NONE ) {
            //自动旋转
            rotateLeft( getAutoRotationAngle() );

        }
        //球坐标的向量角度变换
        spherical.theta += sphericalDelta.theta;
        spherical.phi += sphericalDelta.phi;

        // restrict theta to be between desired limits
        //限制最大值
        spherical.theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, spherical.theta ) );

        // restrict phi to be between desired limits
        //限制最大值
        spherical.phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, spherical.phi ) );

        //限制phi 的极角
        spherical.makeSafe();

        //球的半径缩放
        spherical.radius *= scale;

        // restrict radius to be between desired limits
        //限制最大值
        spherical.radius = Math.max( this.minDistance, Math.min( this.maxDistance, spherical.radius ) );

        // move target to panned location
        //位移时，偏移焦点
        this.target.add( panOffset );

        //根据球坐标系获取点位
        offset.setFromSpherical( spherical );

        // rotate offset back to "camera-up-vector-is-up" space
        //应用翻转四元数
        offset.applyQuaternion( quatInverse );
        //相机位置：焦点加偏移
        position.copy( this.target ).add( offset );
        //相机目标点
        this.object.lookAt( this.target );

        if ( this.enableDamping === true ) {
            //阻尼
            sphericalDelta.theta *= ( 1 - this.dampingFactor );
            sphericalDelta.phi *= ( 1 - this.dampingFactor );

            panOffset.multiplyScalar( 1 - this.dampingFactor );

        } else {
            //重置
            sphericalDelta.set( 0, 0, 0 );
            panOffset.set( 0, 0, 0 );
        }

        scale = 1;

        // update condition is:
        // min(camera displacement, camera rotation in radians)^2 > EPS
        // using small-angle approximation cos(x/2) = 1 - x^2 / 8

        if ( zoomChanged ||
            lastPosition.distanceToSquared( this.object.position ) > EPS ||
            8 * ( 1 - lastQuaternion.dot( this.object.quaternion ) ) > EPS ) {

            this.dispatchEvent( changeEvent );

            lastPosition.copy( this.object.position );
            lastQuaternion.copy( this.object.quaternion );
            zoomChanged = false;

            return true;

        }

        return false;
        
    }
    dispose(){

        this.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
        this.domElement.removeEventListener( 'mousedown', onMouseDown, false );
        this.domElement.removeEventListener( 'wheel', onMouseWheel, false );

        this.domElement.removeEventListener( 'touchstart', onTouchStart, false );
        this.domElement.removeEventListener( 'touchend', onTouchEnd, false );
        this.domElement.removeEventListener( 'touchmove', onTouchMove, false );

        document.removeEventListener( 'mousemove', onMouseMove, false );
        document.removeEventListener( 'mouseup', onMouseUp, false );

        window.removeEventListener( 'keydown', onKeyDown, false );
    }
    onKeyDown( event ) {
        if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;
        scope.handleKeyDown( event );
    }
    handleKeyDown( event ) {
        // console.log( 'handleKeyDown' );
        var needsUpdate = false;
        switch ( event.keyCode ) {
            case this.keys.UP:
                this.pan( 0, this.keyPanSpeed );
                needsUpdate = true;
                break;
            case this.keys.BOTTOM:
                this.pan( 0, - this.keyPanSpeed );
                needsUpdate = true;
                break;
            case this.keys.LEFT:
                this.pan( this.keyPanSpeed, 0 );
                needsUpdate = true;
                break;
            case this.keys.RIGHT:
                this.pan( - this.keyPanSpeed, 0 );
                needsUpdate = true;
                break;
        }
        if ( needsUpdate ) {
            // prevent the browser from scrolling on cursor keys
            event.preventDefault();
            this.update();
        }
    }
    pan( deltaX, deltaY ) {
        var offset = new THREE.Vector3();
        var element = null;
        if(this.size){
            element=this.size;
        }else{
            element = this.domElement === document ? this.domElement.body : this.domElement;
        }
        if ( this.object.isPerspectiveCamera ) {
            // perspective
            //透视相机
            //透视相机位置
            var position = this.object.position;
            //偏移位：相机位减目标位，目标位不一定是相机的目标点，也可能是鼠标位
            offset.copy( position ).sub( this.target );
            //三维向量的欧几里得距离
            var targetDistance = offset.length();
            // half of the fov is center to top of screen
            //this.object.fov 默认60，缩小2 倍，转弧度Math.tan(30* Math.PI / 180.0 ).
            //为何如此？
            //fov的一半是屏幕顶部的中心
            //Math.tan 某一锐角的对边比临边
            //屏幕的实际高的一半
            targetDistance *= Math.tan( ( this.object.fov / 2 ) * Math.PI / 180.0 );
            // we use only clientHeight here so aspect ratio does not distort speed
            // 我们这里只使用clientHeight，因此宽高比不会扭曲速度
            // 第一个形参为何如此? 得到一个移动的比值，默认 9
            //2*targetDistance 是相机可视区域的高度
            //2*targetDistance / element.clientHeight 是相机视口高比canvas 高
            //因此，距离越大，移动范围越大
            let ratio=2*targetDistance / element.clientHeight;
            //横移距离
            let distanceX=deltaX * ratio;
            //纵移距离
            let distanceY=deltaY * ratio;
            this.panLeft(distanceX, this.object.matrix );
            this.panUp( distanceY, this.object.matrix );
        } else if ( this.object.isOrthographicCamera ) {
            // orthographic
            // 正交相机
            // 正交相机宽度
            let orthographicWidth= this.object.right - this.object.left;
            // 正交相机高度
            let orthographicHeight= this.object.top - this.object.bottom;
            //OrthographicCamera.zoom 摄像机的缩放倍数，默认1
            //相机视口宽比canvas 宽
            let ratioHor=orthographicWidth / this.object.zoom / element.clientWidth;
            //相机视口高比canvas 高
            let ratioVert=orthographicHeight / this.object.zoom / element.clientHeight;
            //横移距离
            let distanceX=deltaX * ratioHor;
            //纵移距离
            let distanceY=deltaY * ratioVert;
            panLeft( distanceX, this.object.matrix );
            panUp( distanceY, this.object.matrix );
        } else {
            // camera neither orthographic nor perspective
            console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
            this.enablePan = false;
        }
    };
    panLeft( distance, objectMatrix ) {
        var v = new THREE.Vector3();
        //这操作有点晕
        //从四阶矩阵中获取某第0列的值？
        v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
        //乘以距离
        v.multiplyScalar( - distance );
        //平移的偏移位
        console.log('panOffset',panOffset);
        panOffset.add(v);
        console.log('panOffset',panOffset);
    };
    panUp( distance, objectMatrix ) {
        var v = new THREE.Vector3();
        if ( this.screenSpacePanning === true ) {
            //如果屏幕模式根据相机位移
            v.setFromMatrixColumn( objectMatrix, 1 );
        } else {
            //如果是水平面模式
            v.setFromMatrixColumn( objectMatrix, 0 );
            //叉积运算
            // 基于两个向量，创建唯一平面，获取此平面的法线
            //这是个啥样的平面？啥样的的法线？
            //this.object.up 相机朝向，受lookAt 影响，
            v.crossVectors( this.object.up, v );
        }
        v.multiplyScalar( distance );
        panOffset.add( v );
    };
}