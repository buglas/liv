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
} from 'three'
import Crash from '@/com/Crash'

export default class TransformControls2 extends Group{
    constructor(camera, domElement){
        super();
        //相机，canvas，相机控制器
        this.camera=camera;
        this.domElement=domElement;
        //当前选择对轴
        this.axis=null;
        //模式：位移，旋转，缩放
        this.mode='translate';
        //选择的对象
        this.object=null;
        //所有事件无效
        this.enable=true
        //鼠标划上无效
        this.hoverEnable=true;
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
        }
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
        //轴的包围盒
        this.boundAxis={
            translate:[],
            scale:[],
            rotate:[],
        }
        //虚拟物体
        this.dummyBound=null;
        //控制器物体
        this.transform=null;
        //是否虚拟物体和真实物体分离
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
            //鼠标离开控制轴
            'mouseout':()=>{},
            //可碰撞吸附属性变化时
            'crashable-change':()=>{},
            //可浮动属性变化时
            'floatable-change':()=>{},
            //虚拟物体和真实物体分离时
            //'dummy-sever':()=>{}
        }
        //物体初始位置，参与计算平面位置和恢复
        this.objInitPos=0;
        //控制器位置
        this.transInitPos=0;
        //物体位置到其六个边界的位置
        this.objSubBound={};
        //平面方向，基于view
        this.planeDir={p:1,t:1,r:1,f:1,l:-1,b:-1,c:-1};
        //平面位置,基于view
        this.planeAxis={p:'y',t:'y',r:'x',f:'z',l:'x',b:'y',c:'z'};
        //浮动对象
        this.floatObj=null;
        //可碰撞吸附
        this.crashable=true;
        //可浮动
        this.floatable=true;

        //初始化
        this.init();
    }
    init(){
        //初始化平面
        this.setInitPlane();
        //建立虚拟物体
        this.crtDummy();
        //建立操作轴，并先将其隐藏
        this.crtTransform();
        
        console.log('this.crashable',this.crashable);


        //注册轴与物体点击事件，试试自定义事件,将点击对象赋予object
        let _this=this;
        this.domElement.addEventListener('mousedown',function (event) {
            if(!_this.enable){return}
            _this.mousedownFn(event);
        })
        this.domElement.addEventListener('mouseup',function (event) {
            if(!_this.enable){return}
            _this.mouseupFn(event);
        })
        this.domElement.addEventListener('mousemove',function (event) {
            if(!_this.enable){return}
            _this.mousemoveFn(event);
        })
        window.addEventListener('keydown',function (event) {
            switch (event.key){
                case 'c':
                    //吸附开关
                    _this.toggleCrashable();
                    break;
                case 'f':
                    //浮动开关
                    _this.toggleFloatable();
                    break;
            }
        })
        //设置缩放
        this.setScalar();

    }
    mousedownFn(event){
        console.log(event.buttons);
        switch (event.buttons){
            case 1:
                //鼠标左击
                //鼠标点击在轴上
                this.mousedownOfAxis(event);
                //鼠标拖拽物体
                this.mousedownOfFurn(event);
                break
        }

    }
    mouseupFn(event){
        //拖拽的时候
        this.mouseupOfAxis(event);
        //在空处抬起的时候
        this.mouseupOfEmpty(event);
    }
    mousemoveFn(event){
        //只要轴不为空方可移动
        if(this.axis){
            //恒定控制器大小
            this.setScalar();
            //检测碰撞
            this.checkCrash();
            //移动物体
            this.moveObj(event);

            //需渲染
            this.events['change']();
        }else if (this.hoverEnable){
            //可划上，且轴为空
            //做轴的划上检测
            this.setHoverAxis(event);
        }
        

    }

    //鼠标点击在轴上
    mousedownOfAxis(event){
        if(this.object){
            //.object 存在,说明可以拖拽轴
            //若.axis 不为空，就将其置空。（切断）
            //控制器是否发生改变
            if(this.axis){
                //有轴存在：置空拖拽轴，不是将之隐藏
                this.setAxis(null);
                this.events['change']();
            }
            //▷ 在操作轴里，获取选择对象
            let curSelected=this.getIntersectObject(event);
            if(curSelected){
                //选择了操作轴
                //根据底部子级，获取其对应的指定集合里的元素
                this.setAxis(curSelected.object.name[0]);
                this.setMouseSubSmth(event);
                //启动拖拽事件
                this.events['dragging-changed']({value:true});
                //需渲染
                this.events['change']();
            }
        }
    }
    //鼠标点击在家具上
    mousedownOfFurn(event){
        if (this.axis){return;}
        //选择对象
        let curSelectedObj=this.getIntersectObject(event,this.selectableFurns);
        if(curSelectedObj){
            //存在选择的物体
            //启动拖拽事件
            this.events['dragging-changed']({value:true});
            //选择到了对象
            //let sceneChild=getSceneChild(curSelectedObj.object);
            //从parents中获取包含子元素selected 的元素
            let sceneChild=this.getParentInArray(curSelectedObj.object,this.selectableFurns)

            //选择对象的差异判断
            let transObj=this.object;
            if(transObj){
                //object物体已存在
                //判断之前选择物体和现在选择物体是否是同一个
                if(sceneChild===transObj){
                    //是同一个，更新与物体绑定的变换属性
                    this.updateTransformAttrByObj();
                }else{
                    //不是同一个
                    this.detach(transObj);
                    this.attach(sceneChild);
                    //render();
                    //需渲染
                    this.events['change']();

                }
            }else{
                this.attach(sceneChild);
                //render();
                //需渲染
                this.events['change']();
            }



            //设置拖拽轴
            this.setDragAxisByView();
            //设置鼠标和相关物体的偏移距离
            this.setMouseSubSmth(event);
        }else{
            //啥也没选择到
            //记下鼠标按下的事件，等鼠标抬起时，根据此事件判断是否取消选择
            this.clickTime=new Date();
        }
    }
    //鼠标抬起时，处于拖拽状态
    mouseupOfAxis(event){
        if(this.axis){
            //只要选择了轴，在鼠标抬起时
            //取消轴选择
            this.unactAxis();
            this.axis=null;
            //设置虚拟物体位置
            //虚拟物体位置吻合实际物体位置
            //以应对吸附和浮动的情况
            this.setDummyPosByObj();
            /*if(this.sever){
                //若分离
                //虚拟物体位置吻合实际物体位置
                this.setDummyPosByObj();
            }*/
            //可拖拽
            this.events['dragging-changed']({value:false});
            //需渲染
            this.events['change']();
        }
    }
    //鼠标抬起时，处于空处
    mouseupOfEmpty(event){
        if(this.clickTime){
            let timeDist=new Date()-this.clickTime;
            //此逻辑可外置，亦可内置，特殊情况特殊对待
            if(timeDist<300){
                //取消对象选择
                this.detach();
                //render();
                //需渲染
                this.events['change']();
            }else{
                //借助orbit 旋转场景，物体依旧处于选择状态
                this.clickTime=null;
            }
        }
    }
    //检测碰撞
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
        //分离与否
        this.sever=sever;
        if(sever){
            for(let i=0;i<this.axis.length;i++){
                let axis=this.axis[i];
                this.object.position[axis]=newObjPos[axis];
                this.transform.position[axis]=newObjPos[axis]+this.transSubObj[axis];
            }
        }
    }

    //设置偏移
    setMouseSubSmth(event){
        let focus=this.getFocus(event);
        //设置鼠标位置减物体位置
        this.mouseSubObj=this.getMouseSubObj(focus);
        //鼠标位置减物体中心位置
        this.mouseSubCenter=this.getMouseSubCenter(focus);
        //鼠标位置减控制器位置
        this.mouseSubTrans=this.getMouseSubTrans(focus);
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

    //设置选择的轴
    setAxis(axis){
        if(axis){
            //激活轴
            this.actAxis(axis);
        }else{
            //取消轴选择
            if(this.axis){
                this.unactAxis();
            }
        }
        this.axis=axis;
    }
    //设置划上的轴
    setHoverAxis(event){
        let curSelected=this.getIntersectObject(event);
        if(curSelected){
            let curHoverAxis=curSelected.object.name[0];
            if(this.hoverAxis===curHoverAxis){
                return
            }else{
                this.unactHoverAxis();
                this.hoverAxis=curHoverAxis;
                this.actAxis(this.hoverAxis);
                //需渲染
                this.events['change']();
            }
        }else{
            this.unactHoverAxis();
            //需渲染
            this.events['change']();
        }
    }
    unactHoverAxis(){
        if(this.hoverAxis){
            this.unactAxis(this.hoverAxis);
            this.events['change']();
            this.hoverAxis=null;
        }
    }
    //移动物体
    moveObj(event){
        //设置射线，根据相机和鼠标位
        this.setRaycaster(event);
        //根据浮动设置物体位置
        this.setObjFloatPos()
        //获取鼠标在平面上的焦点
        let focus=this.getFocus();

        //若鼠标点击的位置在视平线以上，相机到鼠标的射线是不会和地面产生焦点的
        if(focus){
            //所选物体和控制轴可见
            this.setVisibleByFocus(true);
            //先根据鼠标位置，设置边界盒子位置
            this.setDummyPosByMouse(focus);
            if(!this.sever){
                //不分离
                this.dragUnsever(focus);
            }
        }else{
            this.setVisibleByFocus(false);
        }
        this.events['change']();
    }
    //根据浮动设置物体位置
    setObjFloatPos(){
        if (!this.floatable){return}
        //根据射线寻找鼠标滑过的浮动面
        let planeAxis=this.planeAxis[this.view];
        let floatObj=this.findFloatObj();
        if(floatObj!==this.floatObj){
            let newPlanePos,oldPlanePos;
            if(floatObj===null){
                //默认水平位置为0
                newPlanePos=0;
            }else{
                newPlanePos=floatObj[this.view];
            }
            if(this.floatObj===null){
                //默认水平位置为0
                oldPlanePos=0;
            }else{
                oldPlanePos=this.floatObj[this.view];
            }

            let objPos=newPlanePos+this.objSubBound[this.view];
            this.object.position[planeAxis]=objPos;
            //重置虚拟盒子位置
            this.dummyBound.box=this.getBox(this.object);

            this.transform.position[planeAxis]=objPos+this.transSubObj[planeAxis];
            this.floatObj=floatObj;
        }
    }
    //根据射线寻找鼠标滑过的浮动面
    findFloatObj(){
        let ray= this.raycaster.ray;
        let floatObj=null;
        //遍历可碰撞物体的浮动三角
        for(let obj of this.crashableMeshs){
            let find=false;
            for(let triangle of obj.floatFaces[this.view]){
                let point=new Vector3();
                point=ray.intersectTriangle(triangle[0],triangle[1],triangle[2],true,point)
                if(point){
                    find=true;
                    break;
                }
            }
            if(find){
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
    //根据焦点设置物体的可见性
    setVisibleByFocus(bool){
        this.object.visible=bool;
        this.visible=bool;
    }
    //获取鼠标在平面上的焦点
    getFocus(){
        let vec3=new Vector3();
        return this.raycaster.ray.intersectPlane(this.plane,vec3);
    }
    setRaycaster(event){
        //视图点
        let pointer=this.getPointer( event,this.domElement);
        //获取射线
        this.raycaster.setFromCamera( pointer, this.camera );
    }
    //获取初始平面
    setInitPlane(){
        //平面的朝向
        let axis=this.axis;
        let plane=null;
        if(this.axis=='y'&&this.view==='p'){
            let camDir=new Vector3();
            camDir=this.camera.getWorldDirection(camDir);
            //平面的朝向
            plane=new Plane(camDir);
            let objPos=this.object.position.clone();
            let translatePos=objPos.add(this.mouseSubObj);
            //平面位移到鼠标所在处
            plane.translate(objPos);
        }else{
            let planeAxis=this.planeAxis[this.view];
            let planeDir=this.planeDir[this.view];
            let vec3Plane=new  Vector3();
            let vec3Pos=new  Vector3();
            vec3Plane[planeAxis]=planeDir;
            vec3Pos[planeAxis]=this.objInitPos+this.mouseSubObj[planeAxis];
            plane=new Plane(vec3Plane);
            plane.translate(vec3Pos);
        }
        /*if((axis==='x'||axis==='z'||axis==='xz')&&this.view==='p'){
            //透视图特殊对待
            //只有操作特定的轴和视图才如此
            plane=new Plane(new Vector3(0,1,0));
            let y=this.objInitPos+this.mouseSubObj.y;
            //let y=this.object.position.y+this.mouseSubObj.y;
            //let y=this.mouseSubObj.y;
            plane.translate(new Vector3(0,y,0));
        }else{

        }*/
        //console.log('planeA',plane);
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

    //自定义事件监听对象
    addEventListener(evt,fn){
        if(this.events[evt]){
            this.events[evt]=fn;
        }else{
            console.log('TansformControls 没有此事件');
        }
    }
    //激活选择的轴
    actAxis(axiss=this.axis){
        let picker=this.transform.getObjectByName(this.mode);
        for(let i=0;i<axiss.length;i++){
            let axis=axiss[i];
            let axisObj=picker.getObjectByName(axis);
            let _this=this;
            axisObj.children.forEach((ele)=>{
                ele.material.opacity=.9;
                ele.material.color.set(_this.yellow);
            })
        }

    }
    //还原轴
    unactAxis(axiss=this.axis){
        let picker=this.transform.getObjectByName(this.mode);
        for(let i=0;i<axiss.length;i++){
            let axis=axiss[i];
            let axisObj=picker.getObjectByName(axis);
            let _this=this;
            axisObj.children.forEach((ele)=>{
                ele.material.opacity=.5;
                ele.material.color.set(_this.axisColor[axis]);
            })
        }

    }
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
    //获取选择的物体
    getIntersectObject(event,objects=this.boundAxis[this.mode]){
        let pointer=this.getPointer( event,this.domElement);
        //获取射线
        this.raycaster.setFromCamera( pointer, this.camera );
        let intersects = this.raycaster.intersectObjects( objects,true);
        return intersects[0];
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
    //附加对象
    attach(object){
        this.visible=true;
        this.object=object;
        //显示操作轴
        let picker=this.transform.getObjectByName(this.mode);
        picker.visible=true;
        //可碰撞物体的删除
        this.deleteCrashableObj(object);
        this.updateTransformAttrByObj();


    }
    //分离
    detach(){
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
    //根据物体更新与其绑定的变换信息
    updateTransformAttrByObj(){
        //object 的中心点
        let center=this.getObjectCenter(this.object);
        let pos=this.object.position.clone();
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
        //建立虚拟盒子
        let box3=new Box3();
        box3.setFromObject(this.object);
        box3.expandByScalar(.001);
        this.dummyBound.box=box3;
    }
    //存储虚拟物体的尺寸
    saveDummySize(){
        let whd=new Vector3();
        whd=this.dummyBound.box.getSize(whd);
        this.dummyBound.whd=whd;
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
    //获取物体中心
    getObjectCenter(object=this.object){
        let box3=new Box3();
        box3.setFromObject(object);
        let center=new Vector3();
        return box3.getCenter(center);
    }

    //建立虚拟物体
    crtDummy(){
        this.dummyBound = new Box3Helper();
        this.dummyBound.material.color.set(0x38ffff);
        this.add( this.dummyBound );
    }
    //建立控制器
    crtTransform(){
        this.transform=new Group();
        this.add(this.transform);

        let gizmoMaterial = new MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity:.5,
            fog: false
        });

        let matBound=gizmoMaterial.clone();
        matBound.opacity=0;

        let matRed = gizmoMaterial.clone();
        matRed.color.set( this.axisColor.x );

        let matGreen = gizmoMaterial.clone();
        matGreen.color.set( this.axisColor.z );

        let matBlue = gizmoMaterial.clone();
        matBlue.color.set( this.axisColor.y );

        let matWhite = gizmoMaterial.clone();
        matWhite.color.set( this.axisColor.xyz );

        /*移动*/
        /*移动轴*/
        //中心盒子
        let box=new BoxBufferGeometry(.1,.1,.1);
        //轴
        let cylinder=new CylinderBufferGeometry(0.04, 0.04, 1, 3, 1, false);
        let m = new Matrix4();
        m.makeTranslation(0,.55,0);
        m.applyToBufferAttribute(cylinder.attributes.position);
        //箭头
        let arrow = new CylinderBufferGeometry( 0, 0.06, 0.3, 6, 1, false);
        m = new Matrix4();
        m.makeTranslation(0,1.2,0);
        m.applyToBufferAttribute(arrow.attributes.position);

        let translateLineY=new Mesh( cylinder, matBlue );
        let translateArrowY=new Mesh( arrow, matBlue );
        translateLineY.name='y-translateLine';
        translateArrowY.name='y-translateArrow';

        let translateLineX=translateLineY.clone();
        translateLineX.material=matRed;
        translateLineX.rotateZ(-Math.PI/2);
        let translateArrowX=translateArrowY.clone();
        translateArrowX.material=matRed;
        translateArrowX.rotateZ(-Math.PI/2);
        translateLineX.name='x-translateLine';
        translateArrowX.name='x-translateArrow';

        let translateLineZ=translateLineY.clone();
        translateLineZ.material=matGreen;
        translateLineZ.rotateX(Math.PI/2);
        let translateArrowZ=translateArrowY.clone();
        translateArrowZ.material=matGreen;
        translateArrowZ.rotateX(Math.PI/2);
        translateLineZ.name='z-translateLine';
        translateArrowZ.name='z-translateArrow';

        let translateY=new Group();
        translateY.name='y';
        translateY.add(translateLineY);
        translateY.add(translateArrowY);

        let translateX=new Group();
        translateX.name='x';
        translateX.add(translateLineX);
        translateX.add(translateArrowX);

        let translateZ=new Group();
        translateZ.name='z';
        translateZ.add(translateLineZ);
        translateZ.add(translateArrowZ);

        let translateXYZ=new Mesh(box,matWhite);
        translateXYZ.name='xyz';

        let PickerTranslate=new Group();
        PickerTranslate.name='translate';

        PickerTranslate.add(translateXYZ);
        PickerTranslate.add(translateX);
        PickerTranslate.add(translateZ);
        PickerTranslate.add(translateY);

        PickerTranslate.visible=false;

        /*移动包围盒*/
        let transBoundBox=new BoxBufferGeometry(.15,1.3,.15);
        m = new Matrix4();
        m.makeTranslation(0,.75,0);
        m.applyToBufferAttribute(transBoundBox.attributes.position);

        let transBoundY=new Mesh(transBoundBox,matBound);
        transBoundY.name='y-transBound';
        this.boundAxis.translate.push(transBoundY);

        let transBoundX=transBoundY.clone();
        transBoundX.name='x-transBound';
        transBoundX.material=matBound;
        transBoundX.rotateZ(-Math.PI/2);
        this.boundAxis.translate.push(transBoundX);


        let transBoundZ=transBoundY.clone();
        transBoundZ.name='z-transBound';
        transBoundZ.material=matBound;
        transBoundZ.rotateX(Math.PI/2);
        this.boundAxis.translate.push(transBoundZ);

        PickerTranslate.add(transBoundY);
        PickerTranslate.add(transBoundX);
        PickerTranslate.add(transBoundZ);

        this.transform.add(PickerTranslate);

        /*旋转*/
        //...

        /*缩放*/
        //...



    }
    setMode(){

    }
    showAxis(){

    }
    setScalar(){
        let worldPosition=new Vector3();
        worldPosition=this.transform.getWorldPosition(worldPosition);
        let eyeDistance = worldPosition.distanceTo( this.camera.position);
        this.transform.scale.set( 1, 1, 1 ).multiplyScalar( eyeDistance * this.size / 7 );
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
    //可碰撞物体的载入
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
                let {min,max}=box;
                let [l,b,c,r,t,f]=[min.x,min.y,min.z,max.x,max.y,max.z];
                _this.crashableMeshs.push({
                    id:obj.id,
                    furnId:furn.id,
                    floatFaces:_this.getFloatFace(l,b,c,r,t,f),
                    p:t,
                    box,l,b,c,r,t,f
                })
            }
        }
    }
    //浮动检测
    checkFloat(){

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
        ]
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
    //可碰撞物体的删除
    deleteCrashableObj(furn){
        let arr=[];
        this.crashableMeshs.forEach((ele,ind)=>{
            if(ele.furnId!==furn.id){
                arr.push(ele)
            }
        })
        this.crashableMeshs=arr;
    }
    //获取边界盒子
    getBox(object){
        let box3=new Box3();
        box3.setFromObject(object);
        return box3;
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
    //可碰撞吸附的变化
    toggleCrashable(){
        this.crashable=!this.crashable;
        if(!this.crashable){
            this.sever=false;
        }
        this.events['crashable-change']({value:this.crashable});
    }
    //可浮动的变化
    toggleFloatable(){
        this.floatable=!this.floatable;
        this.events['floatable-change']({value:this.crashable});
    }
}
