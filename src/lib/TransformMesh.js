/**
 * @author arodic / https://github.com/arodic
 */
import {
    Scene, PerspectiveCamera, WebGLRenderer, Color,
    Geometry,
    AxesHelper, PlaneGeometry, PlaneBufferGeometry, SphereGeometry, BoxGeometry, CylinderGeometry, Plane,
    BufferGeometry, CylinderBufferGeometry, BoxBufferGeometry,
    BufferAttribute,
    Sprite,
    MeshBasicMaterial, MeshLambertMaterial, PointsMaterial, LineBasicMaterial, SpriteMaterial, MeshPhongMaterial,
    Points, Mesh, Line, SkinnedMesh,
    AmbientLight, SpotLight, PointLight, DirectionalLight,
    Fog,
    Vector2, Vector3, Face3,
    Group,
    KeyframeTrack, AnimationClip, AnimationMixer,
    Clock,
    ObjectLoader, AudioLoader,
    Bone, SkeletonHelper,
    AudioListener,
    PositionalAudio, Audio,
    AudioAnalyser,
    Raycaster,
    DirectionalLightHelper,
    Box3, Box3Helper,
    Object3D,
    Matrix4,
    Quaternion, TorusBufferGeometry,
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
        translateY.name='y-translate';
        translateY.add(translateLineY);
        translateY.add(translateArrowY);
        let translateX=new Group();
        translateX.name='x-translate';
        translateX.add(translateLineX);
        translateX.add(translateArrowX);
        let translateZ=new Group();
        translateZ.name='z-translate';
        translateZ.add(translateLineZ);
        translateZ.add(translateArrowZ);
        //盒子网格
        let translateBox=new Mesh(box,this.matWhite);
        translateBox.name='xyz-translate';

        /*移动包围盒*/
        //包围盒模型
        let translateBoundBox=new BoxBufferGeometry(.15,1.3,.15);
        m = new Matrix4();
        m.makeTranslation(0,.75,0);
        m.applyToBufferAttribute(translateBoundBox.attributes.position);
        //xyz 包围盒网格
        let translateBoundY=new Mesh(translateBoundBox,this.matWrapper);
        translateBoundY.name='y-translateBound';
        let translateBoundX=translateBoundY.clone();
        translateBoundX.name='x-translateBound';
        translateBoundX.rotateZ(-Math.PI/2);
        let translateBoundZ=translateBoundY.clone();
        translateBoundZ.name='z-translateBound';
        translateBoundZ.rotateX(Math.PI/2);

        //移动控制器
        //展示模型
        let pickerTranslate=new Group();
        pickerTranslate.name='translate';
        pickerTranslate.add(translateBox);
        pickerTranslate.add(translateX);
        pickerTranslate.add(translateZ);
        pickerTranslate.add(translateY);
        //包裹模型
        pickerTranslate.add(translateBoundY);
        pickerTranslate.add(translateBoundX);
        pickerTranslate.add(translateBoundZ);
        //默认不可见
        pickerTranslate.visible=false;

        //将包裹模型添加到轴的包裹器里
        this.axisWrapper.translate.push(translateBoundY);
        this.axisWrapper.translate.push(translateBoundX);
        this.axisWrapper.translate.push(translateBoundZ);

        //变换对象
        this.add(pickerTranslate);
    }
    initRotation(){
        let geometry = new TorusBufferGeometry( 1.3, .035, 8, 30);
        let rotateZ = new Mesh( geometry, this.matGreen );
        rotateZ.name='z-rotate';
        let rotateY = rotateZ.clone();
        rotateY.rotateX(Math.PI/2);
        rotateY.material=this.matBlue;
        rotateY.name='y-rotate';
        let rotateX = rotateZ.clone();
        rotateX.rotateY(Math.PI/2);
        rotateX.material=this.matRed;
        rotateX.name='x-rotate';



        let geometryBound = new TorusBufferGeometry( 1.3,0.2,3,18);
        //let rotateBoundY=new Mesh( geometryBound, this.matWrapper );
        let rotateBoundZ=new Mesh( geometryBound, this.matWrapper );
        rotateBoundZ.name='z-rotateBound';
        let rotateBoundY=rotateBoundZ.clone();
        rotateBoundY.name='y-rotateBound';
        rotateBoundY.rotateX(Math.PI/2);
        let rotateBoundX=rotateBoundZ.clone();
        rotateBoundX.name='x-rotateBound';
        rotateBoundX.rotateY(Math.PI/2);

        let pickerRotate=new Group();
        pickerRotate.name='rotate';

        pickerRotate.add(rotateZ);
        pickerRotate.add(rotateY);
        pickerRotate.add(rotateX);

        pickerRotate.add(rotateBoundZ);
        pickerRotate.add(rotateBoundY);
        pickerRotate.add(rotateBoundX);

        //默认不可见
        pickerRotate.visible=false;

        //将包裹模型添加到轴的包裹器里
        this.axisWrapper.rotate.push(rotateBoundZ);
        this.axisWrapper.rotate.push(rotateBoundY);
        this.axisWrapper.rotate.push(rotateBoundX);

        this.add(pickerRotate);
    }
    //激活选择的轴
    actAxis(axiss,mode){
        this.loopAxis(axiss,mode,(mat)=>{
            mat.opacity=.9;
            mat.color.set(this.yellow);
        })

    }
    //还原轴
    unactAxis(axiss,mode){
        this.loopAxis(axiss,mode,(mat,axis)=>{
            mat.opacity=.5;
            mat.color.set(this.axisColor[axis]);
        })
    }
    loopAxis(axiss,mode,fn){
        let picker=this.getObjectByName(mode);
        for(let i=0;i<axiss.length;i++){
            let axis=axiss[i];
            let axisObj=picker.getObjectByName(`${axis}-${mode}`);
            let _this=this;
            if(axisObj.children.length){
                axisObj.children.forEach((ele)=>{
                    fn(ele.material,axis);
                })
            }else{
                fn(axisObj.material,axis);
            }

        }
    }
}
