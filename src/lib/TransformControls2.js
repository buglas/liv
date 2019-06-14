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
    constructor(camera, domElement,orbitControls){
        super();
        //相机，canvas，相机控制器
        this.camera=camera;
        this.domElement=domElement;
        this.orbitControls=orbitControls;
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
        //偏移距离，鼠标点击位减去所选物体的距离
        this.mouseSubObj=new Vector3();
        //控制轴的位置减去物体的位置
        this.transSubObj=new Vector3();
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
        //事件列表
        this.events={
            //轴是否被激活。可解决orbitControls 拖拽时遇到的冲突
            'dragging-changed':()=>{},
            //拖拽时，触发change 事件
            'change':()=>{},
            //鼠标划上控制轴
            mouseover:()=>{},
            //鼠标离开控制轴
            mouseout:()=>{},
        }

        //初始化
        this.init();
    }
    init(){
        //建立操作轴，并先将其隐藏
        this.crtPicker();
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
    mouseupFn(event){
        if(this.axis){
            this.unactAxis();
            this.axis=null;
            this.events['dragging-changed']({value:false});
            this.events['change']();
        }
    }
    mousemoveFn(event){
        if(this.axis){
            this.setScalar();
            this.moveObj(event);
        }
        if(this.hoverEnable&&!this.axis){
            this.setHoverAxis(event);
        }
    }
    mousedownFn(event){
        //object 存在与否
        if(this.object){
            //.object 存在
            //若.axis 不为空，就将其置空。（切断）
            //控制器是否发生改变
            let change=false;
            if(this.axis){
                this.setAxis(null);
                change=true;
            }
            //▷ 在操作轴里，获取选择对象
            let curSelected=this.getIntersectObjectInTransform(event);
            if(curSelected){
                //选择了操作轴
                //根据底部子级，获取其对应的指定集合里的元素
                this.setAxis(curSelected.object.name[0]);
                //设置偏移距离
                this.mouseSubObj=curSelected.point.sub(this.object.position);
                //触发事件
                this.events['dragging-changed']({value:true});
                change=true;
            }
            if(change){
                this.events['change']();
            }
        }
    }
    //设置选择的轴
    setAxis(axis){
        if(axis){
            //激活轴
            this.actAxis(axis);
        }else{
            //恢复轴
            if(this.axis){
                this.unactAxis();
            }
        }
        this.axis=axis;
    }
    //设置划上的轴
    setHoverAxis(event){
        let curSelected=this.getIntersectObjectInTransform(event);
        if(curSelected){
            let curHoverAxis=curSelected.object.name[0];
            if(this.hoverAxis===curHoverAxis){
                return
            }else{
                this.unactHoverAxis();
                this.hoverAxis=curHoverAxis;
                this.actAxis(this.hoverAxis);
                this.events['change']();
            }

        }else{
            this.unactHoverAxis();
        }
    }
    unactHoverAxis(){
        if(this.hoverAxis){
            this.unactAxis(this.hoverAxis);
            this.events['change']();
            this.hoverAxis=null;
        }
    }
    getIntersectObjectInTransform(event){
        let pickerChildren=this.getObjectByName(this.mode).children;
        return this.getIntersectObject(event,pickerChildren);
    }
    //移动物体
    moveObj(event){
        //视图点
        let pointer=this.getPointer( event,this.domElement);
        //获取射线
        this.raycaster.setFromCamera( pointer, this.camera );
        let ray= this.raycaster.ray;
        //投射平面
        let plane=this.getPlane();
        //焦点及其是否有焦点
        let focus=new Vector3();
        focus=ray.intersectPlane(plane,focus);
        //若鼠标点击的位置在视平线以上，相机到鼠标的射线是不会和地面产生焦点的
        if(focus){
            this.object.visible=true;
            this.visible=true;
            //鼠标选择点减去偏移量
            //焦点处就是Transform 位
            //焦点减偏移，是为对象位
            let objPos=focus.sub(this.mouseSubObj);
            let transPos=objPos.clone().add(this.transSubObj);
            let axis=this.axis;
            for(let i=0;i<axis.length;i++){
                let axisi=axis[i];
                this.object.position[axisi]=objPos[axisi];
                this.position[axisi]=transPos[axisi];
            }
            this.object.updateMatrix();
            this.updateMatrix();
        }else{
            this.object.visible=false;
            this.visible=false;
        }
        this.events['change']();
    }
    getPlane(){
        //平面的朝向
        let axis=this.axis;
        let plane=null;
        if((axis==='x'||axis==='z'||axis==='xz')&&this.view==='p'){
            console.log('ddddd',this.mouseSubObj.y);
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
        let picker=this.getObjectByName(this.mode);
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
    unactAxis(axiss=this.axis){
        let picker=this.getObjectByName(this.mode);
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
    getParentInArray(selectedect,children){
        let parent=null;
        findRoot(selectedect);
        function findRoot(obj){
            if(children.indexOf(obj)==-1){
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
    getIntersectObject(event,objects){
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
        let picker=this.getObjectByName(this.mode);
        picker.visible=true;
        //将picker 定位到object 的中心点
        //捕捉中心点
        let box3=new Box3();
        box3.setFromObject(object);
        let center=new Vector3();
        center=box3.getCenter(center);
        let pos=object.position.clone();

        //对象中心点减去对象位置
        //原理是相对移动的叠加
        this.transSubObj=center.sub(pos);
        this.position.copy(pos.add(this.transSubObj));

        this.setScalar();

    }
    detach(){
        this.visible=false;
        this.object=null;
        this.setAxis(null);
        this.hoverAxis=null;
    }
    //建立控制器
    crtPicker(){
        let gizmoMaterial = new MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity:.5,
            fog: false
        });

        let matRed = gizmoMaterial.clone();
        matRed.color.set( this.axisColor.x );

        let matGreen = gizmoMaterial.clone();
        matGreen.color.set( this.axisColor.z );

        let matBlue = gizmoMaterial.clone();
        matBlue.color.set( this.axisColor.y );

        let matWhite = gizmoMaterial.clone();
        matWhite.color.set( this.axisColor.xyz );

        /*移动*/
        let box=new BoxBufferGeometry(.1,.1,.1);
        let cylinder=new CylinderBufferGeometry(0.04, 0.04, 1, 3, 1, false);
        let m = new Matrix4();
        m.makeTranslation(0,.55,0);
        m.applyToBufferAttribute(cylinder.attributes.position);
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
        PickerTranslate.add(translateY);
        PickerTranslate.add(translateX);
        PickerTranslate.add(translateZ);
        PickerTranslate.add(translateXYZ);
        PickerTranslate.visible=false;

        this.add(PickerTranslate);
    }
    setMode(){

    }
    showAxis(){

    }
    setScalar(){
        let worldPosition=new Vector3();
        worldPosition=this.getWorldPosition(worldPosition);
        let eyeDistance = worldPosition.distanceTo( this.camera.position);
        this.scale.set( 1, 1, 1 ).multiplyScalar( eyeDistance * this.size / 7 );
    }

}
