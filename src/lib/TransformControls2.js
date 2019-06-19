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
        //控制轴的位置减去物体的位置
        this.transSubObj=new Vector3();
        //物体中心减物体位置
        this.centerSubObj=new Vector3();
        //鼠标点击位减去物体中心，以方便以鼠标为基准移动边界
        //以此边界盒子与其它对象做碰撞检测
        this.mouseSubCenter=new Vector3();
        //鼠标点击位减去控制轴的位置
        this.mouseSubTrans=new Vector3();
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
            //虚拟物体和真实物体分离时
            //'dummy-sever':()=>{}
        }
        //初始化
        this.init();
    }
    init(){
        //建立虚拟物体
        this.crtDummy();
        //建立操作轴，并先将其隐藏
        this.crtTransform();
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
        //捕捉camera 的change 事件
        this.setScalar();

    }
    mousedownFn(event){
        //object 存在与否
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
                //触发事件
                this.events['dragging-changed']({value:true});
                this.events['change']();
            }
        }
    }
    mouseupFn(event){
        if(this.axis){
            //只要选择了轴，在鼠标抬起时
            //取消轴选择
            this.unactAxis();
            this.axis=null;
            //设置虚拟物体位置
            if(this.sever){
                //若分离
                //虚拟物体位置吻合实际物体位置
                this.setDummyPosByObj();
            }
            //可拖拽
            this.events['dragging-changed']({value:false});
            //需渲染
            this.events['change']();
        }
    }
    mousemoveFn(event){
        //只要轴不为空方可移动
        if(this.axis){
            //恒定控制器大小
            this.setScalar();
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
        //获取鼠标在平面上的焦点
        let focus=this.getFocus(event);
        //若鼠标点击的位置在视平线以上，相机到鼠标的射线是不会和地面产生焦点的
        if(focus){
            //所选物体和控制轴可见
            this.setVisibleByFocus(true);
            //先根据鼠标位置，设置边界盒子位置
            this.setDummyPosByMouse(focus);
            if(this.sever){
                //分离
                this.dragSever(focus);
            }else{
                //不分离
                this.dragUnsever(focus);
            }
        }else{
            this.setVisibleByFocus(false);
        }
        this.events['change']();
    }
    //分离的拖拽物体和控制器
    dragSever(focus){

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
    getFocus(event){
        //视图点
        let pointer=this.getPointer( event,this.domElement);
        //获取射线
        this.raycaster.setFromCamera( pointer, this.camera );
        let ray= this.raycaster.ray;
        //投射平面
        let plane=this.getPlane();
        //焦点
        let focus=new Vector3();
        return ray.intersectPlane(plane,focus);
    }
    //获取平面
    getPlane(){
        //平面的朝向
        let axis=this.axis;
        let plane=null;
        if((axis==='x'||axis==='z'||axis==='xz')&&this.view==='p'){
            //只有操作特定的轴和视图才如此
            plane=new Plane(new Vector3(0,1,0));
            let y=this.mouseSubObj.y+this.object.position.y;
            plane.translate(new Vector3(0,y,0));
        }else{
            let camDir=new Vector3();
            camDir=this.camera.getWorldDirection(camDir);
            //平面的朝向
            plane=new Plane(camDir);
            let objPos=this.object.position.clone();
            let translatePos=objPos.add(this.mouseSubObj);
            //平面位移到鼠标所在处
            plane.translate(objPos);
        }
        return plane;
    }
    getVector3ByAxis(){
        switch (this.axis){
            case 'x':
            case 'y':
            case 'z':
        }
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
        //将picker 定位到object 的中心点
        //捕捉中心点
        let center=this.getObjectCenter(object);
        let pos=object.position.clone();
        //控制器位置
        this.transform.position.copy(center);
        //缩放控制器
        this.setScalar();
        //控制器位置减去物体位置
        this.transSubObj=center.clone().sub(pos);
        //物体中心位置减去物体位置
        this.centerSubObj=center.clone().sub(pos);


        //根据实际物体位置设置虚拟物体位置
        this.setDummyPosByObj();
        //存储虚拟物体的尺寸
        let whd=new Vector3();
        whd=this.dummyBound.box.getSize(whd);
        this.dummyBound.whd=whd;
        
    }
    //根据实际物体位置设置虚拟物体位置
    setDummyPosByObj(){
        //建立虚拟盒子
        let box3=new Box3();
        box3.setFromObject(this.object);
        box3.expandByScalar(.001);
        this.dummyBound.box=box3;
    }
    //设置虚拟边界对象的Box，基于鼠标位置，鼠标减中心点和边界盒子的长宽高
    setDummyPosByMouse(point){
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
        this.dummyBound.updateMatrixWorld();
    }
    //获取物体中心
    getObjectCenter(object=this.object){
        let box3=new Box3();
        box3.setFromObject(object);
        let center=new Vector3();
        return box3.getCenter(center);
    }
    //分离
    detach(){
        this.visible=false;
        this.object=null;
        this.setAxis(null);
        this.hoverAxis=null;
    }
    //建立虚拟物体
    crtDummy(){
        this.dummyBound = new Box3Helper();
        this.dummyBound.material.color.set(0xffffff);
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
        let _this=this;
        findChild(furn);
        function findChild(obj){
            if(obj.children.length){
                obj.children.forEach((ele)=>{
                    findChild(ele);
                })
            }else{
                //计算其box 边界
                _this.crashableMeshs.push({
                    box:_this.getBox(obj),
                    id:obj.id,
                    furnId:furn.id
                })
            }
        }
    }
    //获取边界盒子
    getBox(object){
        let box3=new Box3();
        box3.setFromObject(object);
        return box3;
    }

}
