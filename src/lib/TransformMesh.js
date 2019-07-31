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

export default class TransformMesh extends Group{
    constructor(){
        super();
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
        //材质
        this.matWrapper=null;
        this.matRed=null;
        this.matBlue=null;
        this.matGreen=null;
        this.matWhite=null;
        //轴的包围器，用于轴选择
        this.axisWrapper={
            translate:[],
            scale:[],
            rotate:[],
        };

        //初始化
        this.init();
    }
    init(){
        //初始化公共材质
        this.initMat();
        //初始化移动网格
        this.initTranslate();
        //初始化旋转网格
        this.initRotation();
    }
    //初始化公共材质
    initMat(){
        //轴的基本材质
        let gizmoMaterial = new MeshBasicMaterial({
            depthTest: false,
            depthWrite: false,
            transparent: true,
            opacity:.5,
            fog: false
        });
        //包裹包裹材质，不可见
        this.matWrapper=gizmoMaterial.clone();
        this.matWrapper.opacity=0;
        //红蓝绿轴的材质
        this.matRed = gizmoMaterial.clone();
        this.matRed.color.set( this.axisColor.x );
        this.matBlue = gizmoMaterial.clone();
        this.matBlue.color.set( this.axisColor.y );
        this.matGreen = gizmoMaterial.clone();
        this.matGreen.color.set( this.axisColor.z );
        //白色中间盒子材质
        this.matWhite = gizmoMaterial.clone();
        this.matWhite.color.set( this.axisColor.xyz );

    }
    //初始化移动网格
    initTranslate(){
        /*移动*/
        /*移动轴*/
        //轴模型
        let cylinder=new CylinderBufferGeometry(0.035, 0.035, 1, 4, 1, false);
        let m = new Matrix4();
        m.makeTranslation(0,.55,0);
        m.applyToBufferAttribute(cylinder.attributes.position);
        //箭头模型
        let arrow = new CylinderBufferGeometry( 0, 0.06, 0.3, 6, 1, false);
        m = new Matrix4();
        m.makeTranslation(0,1.2,0);
        m.applyToBufferAttribute(arrow.attributes.position);
        //中心盒子模型
        let box=new BoxBufferGeometry(.1,.1,.1);

        //yxz 轴和箭头的网格
        let translateLineY=new Mesh( cylinder, this.matBlue );
        let translateArrowY=new Mesh( arrow, this.matBlue );
        let translateLineX=translateLineY.clone();
        translateLineX.material=this.matRed;
        translateLineX.rotateZ(-Math.PI/2);
        let translateArrowX=translateArrowY.clone();
        translateArrowX.material=this.matRed;
        translateArrowX.rotateZ(-Math.PI/2);
        let translateLineZ=translateLineY.clone();
        translateLineZ.material=this.matGreen;
        translateLineZ.rotateX(Math.PI/2);
        let translateArrowZ=translateArrowY.clone();
        translateArrowZ.material=this.matGreen;
        translateArrowZ.rotateX(Math.PI/2);
        //yxz 轴和箭头的网格打包
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
        //盒子网格
        let translateBox=new Mesh(box,this.matWhite);
        translateBox.name='xyz';

        /*移动包围盒*/
        //包围盒模型
        let transBoundBox=new BoxBufferGeometry(.15,1.3,.15);
        m = new Matrix4();
        m.makeTranslation(0,.75,0);
        m.applyToBufferAttribute(transBoundBox.attributes.position);
        //xyz 包围盒网格
        let transBoundY=new Mesh(transBoundBox,this.matWrapper);
        transBoundY.name='y-transBound';
        let transBoundX=transBoundY.clone();
        transBoundX.name='x-transBound';
        transBoundX.rotateZ(-Math.PI/2);
        let transBoundZ=transBoundY.clone();
        transBoundZ.name='z-transBound';
        transBoundZ.rotateX(Math.PI/2);

        //移动控制器
        //展示模型
        let PickerTranslate=new Group();
        PickerTranslate.name='translate';
        PickerTranslate.add(translateBox);
        PickerTranslate.add(translateX);
        PickerTranslate.add(translateZ);
        PickerTranslate.add(translateY);
        //包裹模型
        PickerTranslate.add(transBoundY);
        PickerTranslate.add(transBoundX);
        PickerTranslate.add(transBoundZ);
        //默认不可见
        PickerTranslate.visible=false;

        //将包裹模型添加到轴的包裹器里
        this.axisWrapper.translate.push(transBoundY);
        this.axisWrapper.translate.push(transBoundX);
        this.axisWrapper.translate.push(transBoundZ);

        //变换对象
        this.add(PickerTranslate);
    }
    initRotation(){

    }
    //激活选择的轴
    actAxis(axiss,mode){
        let picker=this.getObjectByName(mode);
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
    unactAxis(axiss,mode){
        let picker=this.getObjectByName(mode);
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
}
