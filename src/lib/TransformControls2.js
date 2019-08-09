/**
 * @author arodic / https://github.com/arodic
 */
import {
    Scene,PerspectiveCamera,WebGLRenderer,Color,
    Geometry,
    AxesHelper,PlaneGeometry,PlaneBufferGeometry,SphereGeometry,BoxGeometry,CylinderGeometry,Plane,
    BufferGeometry,CylinderBufferGeometry,BoxBufferGeometry,
    BufferAttribute,
    Sprite,
    MeshBasicMaterial,MeshLambertMaterial,PointsMaterial,LineBasicMaterial,SpriteMaterial,MeshPhongMaterial,
    Points,Mesh,Line,SkinnedMesh,
    AmbientLight,SpotLight,PointLight,DirectionalLight,
    Fog,
    Vector2,Vector3,Face3,
    Group,
    KeyframeTrack,AnimationClip,AnimationMixer,
    Clock,
    ObjectLoader,AudioLoader,
    Bone,SkeletonHelper,
    AudioListener,
    PositionalAudio,Audio,
    AudioAnalyser,
    Raycaster,
    DirectionalLightHelper,
    Box3,Box3Helper,
    Object3D,
    Matrix4,
    Quaternion,
} from 'three'
import Crash from '@/com/Crash'
import TransformMesh from '@/lib/TransformMesh'

export default class TransformControls2 extends Group{
    constructor(camera, domElement){
        super();
        //相机，canvas，相机控制器
        this.camera=camera;
        this.domElement=domElement;
        //当前选择对轴
        this.axis=null;
        //模式：位移 translate，旋转 rotate，缩放scale
        this.mode='translate';
        //选择的对象
        this.object=null;
        //所有事件无效
        this.enable=true;
        //鼠标划上无效
        this.hoverEnable=true;
        //貌似一个鼠标位就可以解决很多问题，先放放，继续梳理---------------
        //鼠标点在某个面上的世界为
        this.mousePos=new Vector3();
        //鼠标的视图位置，即点击在canvas 上的位置 mousePosOnViewWhenMouseDown
        this.mousePosOvwd={x:null,y:null};
        //鼠标点击位减去所选物体位置
        this.mouseSubObj=new Vector3();
        //鼠标点击位减去物体中心，以方便以鼠标为基准移动边界
        //以此边界盒子与其它对象做碰撞检测
        this.mouseSubCenter=new Vector3();
        //鼠标点击位减去控制轴的位置
        this.mouseSubTrans=new Vector3();
        //控制轴的位置减去物体的位置
        this.transSubObj=new Vector3();
        //物体中心减物体位置
        this.centerSubObj=new Vector3();
        //要显示的轴，不同视图，显示的轴不同
        //this.axisShow='xyz';
        this.showX=true;
        this.showY=true;
        this.showZ=true;
        //尺寸
        this.size=1;
        //轴的基本色
        this.axisColor={
            x:0xff0000, //红
            y:0x00ff00, //绿
            z:0x0000ff, //蓝
            xyz:0xffffff
        };
        //激活色
        this.yellow=0xffff00;
        //光线投射器
        this.raycaster = new Raycaster();
        //鼠标划上的轴
        this.hoverAxis=null;
        //可见性
        this.visible=false;
        //视图
        this.view='p';
        //轴的包围器，用于轴选择
        this.axisWrapper={
            translate:[],
            scale:[],
            rotate:[],
        };
        //虚拟物体
        this.dummyBound=null;
        //控制器物体
        this.transform=null;
        //是否虚拟物体和真实物体是否分离
        this.sever=false;
        //可选家具物体
        this.selectableFurns=[];
        //可碰撞mesh集合
        this.crashableMeshs=[];
        //点击时间
        this.clickTime=null;
        //浮动平面
        this.plane=null;
        //事件列表
        this.events={
            //轴是否被激活。可解决orbitControls 拖拽时遇到的冲突
            'dragging-changed':()=>{},
            //拖拽时，触发change 事件
            'change':()=>{},
            //鼠标划上控制轴
            'mouseover':()=>{},
            //鼠标离开控制轴
            'mouseout':()=>{},
            //可碰撞吸附属性变化时
            'crashable-change':()=>{},
            //可浮动属性变化时
            'floatable-change':()=>{},
            //家具完成建立
            'crted':()=>{},
        }
        //物体初始位置，参与计算平面位置和恢复
        //这个一个平面在某一轴上的向量长度，有正负之分
        this.objInitPos=0;
        //控制器位置
        this.transInitPos=0;
        //物体位置到其六个边界的位置
        this.objSubBound={};
        //平面的法线朝向的正负，基于view
        this.planeDir={p:1,t:1,r:1,f:1,l:-1,b:-1,c:-1};
        //平面的法线朝向为1或-1 的那个轴, 基于view
        this.planeAxis={p:'y',t:'y',r:'x',f:'z',l:'x',b:'y',c:'z'};
        //浮动对象
        this.floatObj=null;
        //可碰撞吸附
        this.crashable=true;
        //可浮动
        this.floatable=true;
        //拖拽形态：'axis' 轴，'object' 物体,null 啥也没有
        this.dragState=false;
        //家具是否正在建立，悬而未放的状态
        this.crting=false;
        //当鼠标在canvas 上移动时，是否需要更新一下边界和变换控制器。
        //应对当是crting 状态中当家具，通过表单更新属性后的鼠标定位错位问题
        this.transformNeedUpdateOnMove=false;
        //相机到物体的缩放系数缓存
        this.expandRad=0;
        //虚拟物体的缩放系数
        this.dummyBoundExpandScale=200;
        //视图高度
        this.viewH=0;
        //物体的中心位是否是物体的位置
        this.posIsCenter=false;
        //旋转步幅，默认15 度
        this.rotateSpace=15;
        //每次旋转的总度数
        this.rotateNum=0;
        //初始化
        this.init();
    }
    init(){
        //初始化变换环境
        this.initEvironment();
        //初始化事件
        this.initEvents();
    }
    //初始化变换环境
    initEvironment(){
        //初始化平面
        this.setInitPlane();
        //建立操作轴，并先将其隐藏
        this.crtTransform();
    }
    //初始化事件
    initEvents(){
        let _this=this;
        this.domElement.addEventListener('mousedown',function (event) {
            if(!_this.enable){return}
            //点击canvas 的事件冒泡，不要将事件传递给上方物体
            _this.mousedownFn(event);
        },true);
        this.domElement.addEventListener('mouseup',function (event) {
            if(!_this.enable){return}
            _this.mouseupFn(event);
        });
        this.domElement.addEventListener('mousemove',function (event) {
            if(!_this.enable){return}
            _this.mousemoveFn(event);
        });
        window.addEventListener('keydown',function (event) {
            _this.keydownFn(event);
        })
    }

    /*==================== 初始化变换环境相关方法 ====================*/
    //获取初始平面
    setInitPlane(){
        //平面的法线朝向为1 或-1 的那个轴, 基于view
        let planeAxis=this.planeAxis[this.view];
        //平面的法线朝向的正负，基于view
        let planeDir=this.planeDir[this.view];
        //planeAxis 和planeDir 够成列一个具有方向的法线
        //由法线得平面
        let vec3Plane=new  Vector3();
        vec3Plane[planeAxis]=planeDir;
        //平面位置=物体的当前轴位+鼠标到物体距离的当前轴位
        //实际平面的位置默认在鼠标点到物体上的位置
        let vec3Pos=new  Vector3();
        vec3Pos[planeAxis]=this.objInitPos+this.mouseSubObj[planeAxis];
        //貌似可以如此
        //vec3Pos[planeAxis]=this.objInitPos+this.mousePos[planeAxis];
        let plane=new Plane(vec3Plane);
        plane.translate(vec3Pos);
        this.plane=plane;
    }
    //建立控制器
    crtTransform(){
        //加载变换控制器
        this.transform=new TransformMesh();
        this.add(this.transform);
        //根据mode 设置哪一种控制器可见，默认是移动控制器
        //在mode 发生改变时，要显示到控制器也做相应改变
        this.transform.getObjectByName(this.mode).visible=true;
    }

    /*==================== 初始化事件相关方法 ====================*/
    mousedownFn(event){
        switch (event.buttons){
            case 1:
                //左键单击，区别于相机轨道控制器的右击
                this.leftMouseDownFn(event);
                break
        }

    }
    mouseupFn(event){
        //拖拽的时候
        this.mouseupOnAxis(event);
        //在空处抬起的时候
        this.mouseupOnEmpty(event);
        //拖拽形态
        this.dragState=null;
    }
    mousemoveFn(event){
        //只要轴不为空方可移动
        if(this.axis){
            //是否需要更新控制器和虚拟对象
            if(this.transformNeedUpdateOnMove){
                this.transformNeedUpdateOnMove=false;
                //根据物体，设置鼠标与其它点位的位置关系
                this.updateMouseAttrByObj();
                //根据物体更新与其绑定的控制器信息
                this.updateTransformAttrByObj();
                //恒定控制器大小
                this.setScalar();
            }
            if(this.mode==='translate'){
                //如果是移动模式
                //检测碰撞，吸附物体
                this.checkCrash();
                //移动物体
                this.moveObj(event);
            }else if(this.mode==='rotate'){
                //如果是旋转模式
               this.rotateObj(event);
            }
            //需渲染
            this.change();
            //触发变换信息改变事件
            this.transformChange();
        }else if (this.hoverEnable){
            //非拖拽状态
            //可划上，且轴为空
            //做轴的划上检测
            this.setHoverAxis(event);
        }
    }
    keydownFn(event){
        //按键切换吸附与浮动
        if(event.shiftKey){
            switch (event.key) {
                case 'C':
                    //吸附开关
                    this.toggleCrashable();
                    break;
                case 'F':
                    //浮动开关
                    this.toggleFloatable();
                    break;
            }
        }else{
            switch (event.key) {
                case 'w':
                    //移动模式开关
                    this.setMode('translate');
                    //须渲染
                    this.change();
                    break;
                case 'r':
                    console.log('r');
                    //旋转模式开关
                    this.setMode('rotate');
                    //须渲染
                    this.change();
                    break;
            }
        }
    }

    /*-------------------- 初始化事件相关方法 - 子方法 --------------------*/

    /*=======.......... mousedownFn ..........=======*/
    //鼠标左击
    leftMouseDownFn(event){
        //鼠标左击
        if(this.object){
            //.object 存在,则有拖拽轴
            //若.axis 不为空，就将其置空。（切断）
            //控制器是否发生改变
            if(this.axis){
                //有轴存在
                //置空拖拽轴，取消轴选择
                this.setAxis(null);
                //识别家具在建状态，触发家具创建完成事件。
                this.checkCrting();
                //触发渲染事件
                this.change();
            }
            //在包裹操作轴包裹起的集合里，获取选择对象。默认遍历集合是操作轴。
            let curSelected=this.getIntersectAxis(event);
            if(curSelected){
                //鼠标点击在轴上
                this.mousedownOfAxis(event,curSelected);
                //代码到此为止
                return;
            }
        }
        //如果没有选择轴，判断是否选择里物体
        if(!this.axis){
            let curSelectedObj=this.getIntersectAxis(event,this.selectableFurns);
            if(curSelectedObj){
                this.mousedownOfFurn(event,curSelectedObj);
            }else{
                this.dragState=null;
                this.clickTime=new Date();
            }
        }
    }
    /*..........==== 相关子方法 ====..........*/
    //设置选择的轴为激活状态，还是非激活状态
    setAxis(axis){
        if(axis){
            //激活轴
            this.transform.actAxis(axis,this.mode);
        }else if(this.axis){
            //取消轴选择
            this.transform.unactAxis(this.axis,this.mode);
        }
        this.axis=axis;
    }
    //识别家具在建状态，触发家具创建完成事件。
    checkCrting(){
        //当正在创建家具时，当前鼠标没有按下左键，但存在curSelectedObj
        //鼠标但点击直接放下物体，取消选择
        //启用orbit
        if(this.crting){
            this.crting=false;
            //家具建立完成事件，前端页面里的家具按钮可以取消选择态
            this.crted();
        }
    }
    //获取选择的物体
    getIntersectAxis(event,objects=this.transform.axisWrapper[this.mode]){
        //设置射线方向，基于鼠标和相机位
        this.setRaycaster(event);
        //获取点击集合
        let intersects = this.raycaster.intersectObjects( objects,true);
        //返回第一个物体
        return intersects[0];
    }
    //鼠标点击在轴上
    mousedownOfAxis(event,curSelected){
        //记录拖拽形态
        this.dragState='axis';
        //设置当前操作的轴axis
        //根据底部子级，获取其对应的指定集合里的元素
        this.setAxis(curSelected.object.name[0]);
        //透视图中，根据当前的拖拽轴切换平面
        //在其它视图，平面会直接在init 里初始化
        this.setPlaneIfInP();
        //设置鼠标和相关物体的偏移距离
        this.setMouseSubSmth(event);
        //启动拖拽事件
        this.draggingChanged(true);
        //如果是旋转模式
        if(this.mode==='rotate'){
            //记录下视图点击位
            this.mousePosOvwd=this.getClientPos( event);
            //获取一下视图高
            this.viewH=this.domElement.clientHeight;
            //先将旋转总度数置空
            this.rotateNum=0;
        }
        this.change();
    }
    //鼠标点击在家具上,即拖拽家具的情况
    mousedownOfFurn(event,curSelected){
        //记录拖拽形态
        this.dragState='object';
        //存在选择的物体
        //启动拖拽事件
        this.draggingChanged(true);
        //如果在透视图，切换this.plane 为水平面
        this.setPlaneIfInP();
        //获取包涵当前选择对象的的可选择物体
        let sceneChild=this.getParentInArray(curSelected.object,this.selectableFurns);
        //选择对象
        this.selectObj(sceneChild);
        //设置拖拽轴
        this.setDragAxisByView();
        //设置鼠标和相关物体的偏移距离
        this.setMouseSubSmth(event);
    }
    /*.......... mousedownOfAxis ..........*/
    //透视图中，根据当前的拖拽轴切换平面
    setPlaneIfInP(){
        if(this.view==='p'){
            if(this.axis==='y'){
                this.setInitPlaneInPforY();
            }else{
                this.setInitPlane();
            }
        }
    }
    //设置鼠标和相关物体的偏移距离
    setMouseSubSmth(event){
        let focus=this.getFocus(event);
        //设置鼠标位置减物体位置
        this.mouseSubObj=this.getMouseSubObj(focus);
        //鼠标位置减物体中心位置
        this.mouseSubCenter=this.getMouseSubCenter(focus);
        //鼠标位置减控制器位置
        this.mouseSubTrans=this.getMouseSubTrans(focus);
    }
    //获取鼠标在平面上的焦点
    getFocus(){
        let vec3=new Vector3();
        return this.raycaster.ray.intersectPlane(this.plane,vec3);
    }
    getMouseSubObj(point,obj=this.object){
        return point.clone().sub(obj.position)
    }
    getMouseSubCenter(point,obj=this.object){
        return point.clone().sub(this.getObjectCenter(obj));
    }
    getMouseSubTrans(point,obj=this.object){
        //当前将控制器位置暂定位为中心点
        return point.clone().sub(this.getObjectCenter(obj));
    }
    /*.......... mousedownOfFurn ..........*/
    //从parents中获取包含子元素selected 的元素
    getParentInArray(selected,parents){
        let parent=null;
        findRoot(selected);
        function findRoot(obj){
            if(parents.indexOf(obj)==-1){
                if(obj.parent){
                    findRoot(obj.parent);
                }
            }else{
                parent=obj;
            }
        }
        return parent;
    }
    //选择物体。将还处于选择态的分离，当前选中的附加
    selectObj(sceneChild){
        let transObj=this.object;
        if(transObj){
            //object物体已存在
            //判断之前选择物体和现在选择物体是否是同一个
            if(sceneChild!==transObj){
                //不是同一个
                //分离
                this.detach(transObj);
                //附加
                this.attach(sceneChild);
                //需渲染
                this.change();
            }
        }else{
            //附加
            this.attach(sceneChild);
            //需渲染
            this.change();
        }
    }
    //根据view 设置拖拽轴
    setDragAxisByView(){
        switch (this.view){
            case 'p':
            case 'b':
            case 't':
                this.setAxis('xz');
                break;
            case 'f':
            case 'c':
                this.setAxis('xy');
                break;
            case 'l':
            case 'r':
                this.setAxis('zy');
                break;
        }
    }
    //分离
    detach(){
        //触发物体取消徐选择事件
        this.unselected();
        //可碰撞物体的载入
        this.addCrashableObj(this.object);
        //控制轴、虚拟物体都不可见
        this.visible=false;
        //当前选择物体置空
        this.object=null;
        //取消选择轴
        this.setAxis(null);
        //没有划上的轴
        this.hoverAxis=null;
    }
    //附加对象
    attach(object){
        this.visible=true;
        this.object=object;
        //从可碰撞物体集合里的删除当前选择物体
        this.deleteCrashableObj(object);
        //若没有虚拟对象就建立一个，虚拟对象只要部位null，虚拟对象就不会被再次添加列
        if(!this.dummyBound){this.crtDummy()}
        //根据物体更新与其绑定的变换信息
        this.updateTransformAttrByObj();
        //触发选择事件
        if(!this.crting){
            this.selected(object);
        }
    }
    /*=====>>> detach 子方法 <<<=====*/
    //可碰撞物体的载入
    //将家具分解到Mesh 层，根据每个mesh 提取一个边界盒子，添加到可碰撞集合里
    addCrashableObj(furn){
        if(!furn){return}
        for(let crashableMesh of this.crashableMeshs){
            if (crashableMesh.furnId===furn.id){
                //return 会终止循环和方法内的单线程
                return;
            }
        }
        let _this=this;
        findChild(furn);
        function findChild(obj){
            if(obj.children.length){
                obj.children.forEach((ele)=>{
                    findChild(ele);
                })
            }else{
                //计算其box 边界
                let box=_this.getBox(obj);
                //获取两个极点的三个轴共六个值
                let {min,max}=box;
                let [l,b,c,r,t,f]=[min.x,min.y,min.z,max.x,max.y,max.z];
                //添加可碰撞网格数据到集合中
                _this.crashableMeshs.push({
                    //包裹里所有Mesh 到家具id
                    furnId:furn.id,
                    //当前边界盒子到id
                    id:obj.id,
                    //边界盒子实物
                    box,
                    //边界盒子到六个面
                    floatFaces:_this.getFloatFace(l,b,c,r,t,f),
                    //七个视图方位
                    p:t,l,b,c,r,t,f
                })
            }
        }
    }
    //获取可碰撞物体的浮动面
    getFloatFace(l,b,c,r,t,f){
        let [ltc,ltf,rtf,rtc,lbc,lbf,rbf,rbc]=[
            new Vector3(l,t,c),
            new Vector3(l,t,f),
            new Vector3(r,t,f),
            new Vector3(r,t,c),
            new Vector3(l,b,c),
            new Vector3(l,b,f),
            new Vector3(r,b,f),
            new Vector3(r,b,c),
        ];
        return {
            p:[[ltc,ltf,rtf],[rtf,rtc,ltc]],
            t:[[ltc,ltf,rtf],[rtf,rtc,ltc]],
            b:[[lbf,lbc,rbc],[rbc,rbf,lbf]],
            f:[[ltf,lbf,rbf],[rbf,rtf,ltf]],
            c:[[rtc,rbc,lbc],[lbc,ltc,rtc]],
            l:[[ltc,lbc,lbf],[lbf,ltf,ltc]],
            r:[[rtf,rbf,rbc],[rbc,rtc,rtf]],
        }
    }
    /*=====>>> attach 子方法 <<<=====*/
    //可碰撞物体的删除
    deleteCrashableObj(furn){
        this.crashableMeshs=this.crashableMeshs.filter((ele)=>{
            return ele.furnId!==furn.id;
        });
    }
    //建立虚拟物体
    crtDummy(){
        if(!this.object){return}
        this.dummyBound = new Box3Helper();
        this.dummyBound.material=new LineBasicMaterial({
            color:0x38ffff,
            depthTest:false,
            depthWrite:false,
            fog:false
        });
        this.add( this.dummyBound );
    }
    //更新虚拟框材质
    //解决线框深度被贴图遮挡的bug
    updateDummyMat(){
        if(this.object){
            this.dummyBound.material=this.dummyBound.material.clone();
        }
    }

    /*=======.......... mouseupFn ..........=======*/
    //鼠标抬起时，处于拖拽状态
    mouseupOnAxis(event){
        if(this.axis){
            //只要选择了轴，在鼠标抬起时
            //取消轴选择
            if(this.dragState!=='axis'){
                this.transform.unactAxis(this.axis,this.mode);
            }
            //正在操作的轴置空
            this.axis=null;
            //设置虚拟物体位置
            //虚拟物体位置吻合实际物体位置
            //以应对吸附和浮动的情况
            this.updateTransformAttrByObj();
            //可拖拽
            this.draggingChanged(false);
            //需渲染
            this.change();
        }
    }
    //鼠标抬起时，处于空处
    mouseupOnEmpty(event){
        if(this.clickTime){
            let timeDist=new Date()-this.clickTime;
            //此逻辑可外置，亦可内置，特殊情况特殊对待
            if(timeDist<300){
                //取消对象选择
                this.detach();
                //需渲染
                this.change();
            }else{
                //借助orbit 旋转场景，物体依旧处于选择状态
                this.clickTime=null;
            }
        }
    }

    /*=======.......... mousemoveFn ..........=======*/
    //根据物体，设置鼠标与其它点位的位置关系
    //适用于crting 状态下，拖拽的物体
    updateMouseAttrByObj(){
        let point=this.getObjectCenter();
        this.mouseSubObj=this.getMouseSubObj(point);
        this.mouseSubCenter=this.getMouseSubCenter(point);
        this.mouseSubTrans=this.getMouseSubTrans(point);
    }
    //根据物体更新与其绑定的变换信息
    updateTransformAttrByObj(){
        //object 的中心点
        let center=this.getObjectCenter(this.object);
        let pos=this.object.position.clone();

        this.posIsCenter=center.equals(pos);

        //控制器位置
        this.transform.position.copy(center);
        //缩放控制器
        this.setScalar();
        //平面偏移位置
        let planeAxis=this.planeAxis[this.view];
        this.objInitPos=pos[planeAxis];
        this.transInitPos=this.transform.position[planeAxis];
        //控制器位置减去物体位置
        this.transSubObj=center.clone().sub(pos);
        //物体中心位置减去物体位置
        this.centerSubObj=center.clone().sub(pos);
        //根据实际物体位置设置虚拟物体位置
        this.setDummyPosByObj();
        //存储虚拟物体的尺寸
        this.saveDummySize();
        //物体位置减其六个边界的位置
        this.setObjSubBound();

        this.floatObj=null;
    }
    //检测碰撞，吸附物体
    checkCrash(){
        if(!this.crashable){return}
        //分离
        let sever=false;
        //吸附偏移后的物体位置
        let newObjPos=Crash.getDragedObjPos(
            this,
            function () {
                sever=true;
            }
        );
        this.sever=sever;
        if(sever){
            //若实物因吸附和虚拟边界产生分离
            //移动实物
            for(let i=0;i<this.axis.length;i++){
                let axis=this.axis[i];
                this.object.position[axis]=newObjPos[axis];
                this.transform.position[axis]=newObjPos[axis]+this.transSubObj[axis];
            }
        }
    }
    //移动物体
    moveObj(event){
        //设置射线方向，基于鼠标和相机位
        this.setRaycaster(event);
        //根据浮动设置物体位置
        this.setObjFloatPos();
        //获取鼠标在平面上的焦点
        let focus=this.getFocus();
        //若鼠标点击的位置在视平线以上，相机到鼠标的射线是不会和地面产生焦点的
        if(focus){
            //所选物体和控制轴可见
            this.setVisibleByFocus(true);
            //先根据鼠标位置，设置边界盒子位置
            this.setDummyPosByMouse(focus);
            if(!this.sever){
                //虚拟物体和真实物体未分离
                this.dragUnsever(focus);
            }
        }else{
            //若鼠标跑出离平面，物体和控制器不可见
            this.setVisibleByFocus(false);
        }
        this.change();
    }
    //旋转物体
    rotateObj(event){
        //旋转物体
        let point=this.getClientPos(event);
        //鼠标位移距离
        let dist=0;
        if(this.axis==='y'){
            //绕y 轴旋转时，捕捉横屏距离
            dist=point.x-this.mousePosOvwd.x;
            this.mousePosOvwd.x=point.x;
        }else{
            //绕先x,z 轴旋转时，捕捉竖屏距离
            dist=point.y-this.mousePosOvwd.y;
            this.mousePosOvwd.y=point.y;
        }
        //以竖屏为基准判断位移比例
        let ratio=dist/this.viewH;
        //用比例换算旋转角度
        let degree=ratio*360*4;
        //累计旋转角度
        this.rotateNum+=degree;
        //若角度为0，或累计旋转角度小于旋转步幅，返回
        if(!degree||Math.abs(this.rotateNum)<this.rotateSpace){
            return
        }
        //旋转角度，判断正负
        let rotateNum=this.rotateNum<0?-this.rotateSpace:this.rotateSpace;
        if(this.axis==='x'){
            //若绕x 轴旋转，反一下
            rotateNum=-rotateNum;
        }
        //弧度转角度
        let radian=rotateNum*Math.PI/180;
        //旋转轴
        let rotateAxis=new Vector3();
        rotateAxis[this.axis]=1;
        if(this.posIsCenter){
            //如果物体位就是中心位，直接旋转
            this.object.rotateOnWorldAxis(rotateAxis,radian);
        }else{
            this.object.rotateOnWorldAxis(rotateAxis,radian);
            //获取物体中心到物体位置到距离
            this.centerSubObj=this.getObjectCenter().sub(this.object.position);
            //将transform 位置减去此距离
            //就是物体到决定位
            let pos=this.transform.position.clone().sub(this.centerSubObj);
            this.object.position.copy(pos);
        }
        //根据物体位更新虚拟对象位
        this.setDummyPosByObj();
        //旋转积数置空
        this.rotateNum=0;
    }
    //缩放控制器
    setScalar(){
        let rad=this.cameraToObjectRad();
        if(this.expandRad===rad){return}
        this.transform.scale.set( 1, 1, 1 ).multiplyScalar(rad);
        /*let dummyBound=this.dummyBound;
        if(dummyBound&&dummyBound.box){
            //存在虚拟盒子
            //先缩回去
            dummyBound.box.expandByScalar(-this.expandRad/this.dummyBoundExpandScale);
            //再重新放大
            dummyBound.box.expandByScalar(rad/this.dummyBoundExpandScale);
        }*/
        this.expandRad=rad;

    }
    //设置轴为划上状态
    setHoverAxis(event){
        //获取划上的轴
        let curSelected=this.getIntersectAxis(event);
        if(curSelected){
            //提取关键轴信息，x y z,实际应该提起'-' 之前的部分
            let curHoverAxis=curSelected.object.name[0];
            if(this.hoverAxis===curHoverAxis){
                //轴相同，则返回
                return
            }else{
                //轴不同，先恢复原始轴状态
                this.unactHoverAxis();
                //更新划上轴
                this.hoverAxis=curHoverAxis;
                //设置轴效果
                this.transform.actAxis(this.hoverAxis,this.mode);
                //需渲染
                this.change();
            }
        }else{
            this.unactHoverAxis();
            //需渲染
            this.change();
        }
    }
    /*..........==== 相关子方法 ====..........*/
    /*.......... moveObj ..........*/
    //设置射线方向，基于鼠标和相机位
    setRaycaster(event){
        //视图点
        let pointer=this.getPointer( event,this.domElement);
        //获取射线
        this.raycaster.setFromCamera( pointer, this.camera );
    }
    //根据浮动设置物体位置
    setObjFloatPos(){
        //若仅用浮动，则返回
        if (!this.floatable){return}
        //根据射线寻找鼠标滑过的浮动面
        let planeAxis=this.planeAxis[this.view];
        let floatObj=this.findFloatObj();
        if(floatObj!==this.floatObj){
            let newPlanePos;
            if(floatObj===null){
                //默认水平位置为0
                newPlanePos=0;
            }else{
                newPlanePos=floatObj[this.view];
            }
            //物体浮动后的位置 = 新的平面位 + 物体位减相应边界
            let objPos=newPlanePos+this.objSubBound[this.view];
            //物体浮动
            this.object.position[planeAxis]=objPos;
            //重置虚拟盒子位置
            //this.setDummyPosByObj();
            //重置控制器位置
            //this.transform.position[planeAxis]=objPos+this.transSubObj[planeAxis];
            this.updateTransformAttrByObj();
            this.floatObj=floatObj;
        }
    }
    //根据焦点设置物体的可见性
    setVisibleByFocus(bool){
        this.object.visible=bool;
        this.visible=bool;
    }
    //设置虚拟边界对象的Box，基于鼠标位置，鼠标减中心点和边界盒子的长宽高
    setDummyPosByMouse(point){
        //盒子的中心点
        //焦点减鼠标减中心点的位置
        let boxCenter=point.clone().sub(this.mouseSubCenter);
        let dis=this.dummyBound.whd.clone().divideScalar(2);
        let min1=boxCenter.clone().sub(dis);
        let max1=boxCenter.clone().add(dis);
        let box2=this.dummyBound.box;
        let min2=box2.min;
        let max2=box2.max;
        let axis=this.axis;
        for(let i=0;i<axis.length;i++){
            let axisi=axis[i];
            min2[axisi]=min1[axisi];
            max2[axisi]=max1[axisi];
        }
        let box3=new Box3(min2,max2);
        this.dummyBound.box=box3;
        //this.dummyBound.updateMatrixWorld();
    }
    //不分离的拖拽物体和控制器
    dragUnsever(focus){
        //基于鼠标获取物体位置
        let objPos=focus.clone().sub(this.mouseSubObj);
        //基于鼠标获取控制器位置
        let transPos=focus.clone().sub(this.mouseSubTrans);
        for(let i=0;i<this.axis.length;i++){
            let axisi=this.axis[i];
            this.object.position[axisi]=objPos[axisi];
            this.transform.position[axisi]=transPos[axisi];
        }
        this.object.updateMatrix();
        this.transform.updateMatrix();
    }
    /*.......... setHoverAxis ..........*/
    //设置轴为普通状态
    unactHoverAxis(){
        if(this.hoverAxis){
            //样式还原
            this.transform.unactAxis(this.hoverAxis,this.mode);
            //变量置空
            this.hoverAxis=null;
            //渲染
            this.change();

        }
    }
    /*--->>> setObjFloatPos <<<---*/
    //根据射线寻找鼠标滑过的浮动物体
    findFloatObj(){
        let ray= this.raycaster.ray;
        let floatObj=null;
        //遍历可碰撞物体集合
        for(let obj of this.crashableMeshs){
            let find=false;
            //遍历可碰撞物体的，可以被鼠标划过的，面的两个三角，一个面有三个三角
            for(let triangle of obj.floatFaces[this.view]){
                //获取射线在三角上的焦点
                let point=new Vector3();
                //若没有焦点，intersectTriangle 会返回null
                point=ray.intersectTriangle(triangle[0],triangle[1],triangle[2],true,point);
                if(point){
                    //若是找到焦点，跳出当前for 循环
                    find=true;
                    break;
                }
            }
            if(find){
                //若找到里焦点
                //根据视图获取离相机最近的物体
                if(floatObj){
                    let bool=floatObj[this.view]>obj[this.view];
                    if(['p','t','r','f'].includes(this.view)){
                        if (!bool){
                            //取大值
                            floatObj=obj;
                        }
                    }else{
                        if (bool){
                            //取小值
                            floatObj=obj;
                        }
                    }
                }else{
                    floatObj=obj;
                }
            }
        }
        return floatObj;
    }


    /*=======.......... keydownFn ..........=======*/
    //可碰撞吸附的变化
    toggleCrashable(){
        this.crashable=!this.crashable;
        if(!this.crashable){
            //若不可碰撞，也就没有分离
            this.sever=false;
        }
        this.crashableChange(this.crashable);
    }
    //可浮动的变化
    toggleFloatable(){
        this.floatable=!this.floatable;
        this.floatableChange(this.floatable);
    }
    //模式设置
    setMode(mode){
        if(this.mode===mode){return}
        this.transform.getObjectByName(this.mode).visible=false;
        this.transform.getObjectByName(mode).visible=true;
        //触发控制器类型的改变事件，一新，一旧
        this.modeChange(mode,this.mode);
        this.mode=mode;

    }


    /*..........==== 其它子方法 ====..........*/
    //在透视图，轴向为有y 时的平面
    setInitPlaneInPforY(){
        let plane=null;
        let camDir=new Vector3();
        camDir=this.camera.getWorldDirection(camDir);
        //平面的朝向
        plane=new Plane(camDir);
        let objPos=this.object.position.clone();
        let translatePos=objPos.add(this.mouseSubObj);
        //平面位移到鼠标所在处
        plane.translate(objPos);
        this.plane=plane;
    }
    //根据向量和距离设置浮动平面
    getFloatPlane(pos,axis){
        let vec3Plane=new Vector3();
        vec3Plane[axis]=1;
        let plane=new Plane(vec3Plane);
        let objPos=new Vector3();
        objPos[axis]=pos;
        plane.translate(objPos);
        return plane;
    }
    //根据视图获取轴
    getAxisByView(){
        let axis=null;
        switch (this.view){
            case 'p':
            case 'b':
            case 't':
                axis='y';
                break;
            case 'f':
            case 'c':
                axis='z';
                break;
            case 'l':
            case 'r':
                axis='x';
                break;
        }
        return axis;
    }
    //获取鼠标在屏幕上的点
    getPointer(event,domElement){
        const rect = domElement.getBoundingClientRect();
        return {
            x: ( event.clientX - rect.left ) / rect.width * 2 - 1,
            y: - ( event.clientY - rect.top ) / rect.height * 2 + 1,
            button: event.button
        };
    }
    //获取鼠标点击位，无转换
    getClientPos(event){
        return {
            x:event.clientX,
            y:-event.clientY
        }
    }
    //物体位置减其六个边界的位置
    setObjSubBound(){
        let pos=this.object.position;
        let {min,max}=this.dummyBound.box;
        let [l,b,c,r,t,f]=[min.x,min.y,min.z,max.x,max.y,max.z];
        this.objSubBound={
            p:pos.y-b,
            t:pos.y-b,
            b:pos.y-t,
            l:pos.x-r,
            r:pos.x-l,
            f:pos.z-c,
            c:pos.z-f
        };
    }
    //根据实际物体位置设置虚拟物体位置
    setDummyPosByObj(){
        //if(!this.object){return}
        //建立虚拟盒子
        let box3=new Box3();
        box3.setFromObject(this.object);
        //box3.expandByScalar(this.cameraToObjectRad()/this.dummyBoundExpandScale);
        this.dummyBound.box=box3;
    }
    //存储虚拟物体的尺寸
    saveDummySize(){
        let whd=new Vector3();
        whd=this.dummyBound.box.getSize(whd);
        this.dummyBound.whd=whd;
    }
    //获取物体中心
    getObjectCenter(object=this.object){
        let box3=this.getBox(object);
        return box3.getCenter(new Vector3());
    }
    //获取相机到物体的恒定比
    cameraToObjectRad(){
        let worldPosition=new Vector3();
        worldPosition=this.transform.getWorldPosition(worldPosition);
        let zoom=this.camera.zoom;
        let eyeDistance = worldPosition.distanceTo( this.camera.position);
        let rad=null;
        if(this.camera.isPerspectiveCamera){
            rad=eyeDistance * this.size / 10;
        }else{
            rad=140/zoom;
        }
        return rad;
    }


    /*与轴无关的东东*/
    //加工数据
    machine(furn,crashable=true){
        //先不考虑重复
        this.selectableFurns.push(furn);
        if(!crashable){return}
        //可碰撞物体的载入
        this.addCrashableObj(furn);
    }
    //获取边界盒子
    getBox(object=this.object){
        let box3=new Box3();
        box3.setFromObject(object);
        return box3;
    }

    /*事件当触发*/
    //需渲染的事件
    change(){
        this.dispatchEvent({type:'change'});
    }
    //拖拽变换事件，解决orbit 冲突
    draggingChanged(value){
        this.dispatchEvent({type:'dragging-changed',value:value});
    }
    //可吸附属性改变时，触发此事件。用于前端相关按钮的显示
    crashableChange(value){
        this.dispatchEvent({type:'crashable-change',value:value});
    }
    //可浮动属性改变时，触发此事件。用于前端相关按钮的显示
    floatableChange(value){
        this.dispatchEvent({type:'floatable-change',value:value});
    }
    //mode 改变时
    modeChange(value,oldValue){
        console.log('=======mode-change-----');
        this.dispatchEvent({type:'mode-change',value:value,oldValue:oldValue});
    }
    //家具创建成功后。用于响应前端状态
    crted(){
        this.dispatchEvent({type:'crted'});
    }
    //家具取消选择时
    unselected(){
        this.dispatchEvent({type:'unselected'});
    }
    //家具选择时
    selected(value){
        this.dispatchEvent({type:'selected',value:value});
    }
    //家具位置的改变时
    transformChange(value=this.object){
        this.dispatchEvent({type:'transform-change',value:value});
    }
}
