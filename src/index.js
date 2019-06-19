import * as THREE from 'three';

import OrbitControls from 'three-orbitcontrols'
import {GUI} from 'dat.gui'
import TransformControls from '@/lib/TransformControls'
import Stats  from '@/lib/Stats'
import DiTai from '@/furns/DiTai'
import TransformControls2 from '@/lib/TransformControls2'
import Mats from '@/com/Mats'
import Crash from '@/com/Crash'


const {
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
    Float32BufferAttribute,
    DoubleSide,
    Matrix4
}=THREE;
(function(global){
    if(!global.requestAnimationFrame){
        global.requestAnimationFrame =(global.webkitRequestAnimationFrame||
            global.mozRequestAnimationFrame||
            global.oRequestAnimationFrame||
            global.msRequestAnimationFrame||
            function(callback){
                return global.setTimeout(callback,1000/60);
            });
    }
    if (!global.cancelAnimationFrame) {
        global.cancelAnimationFrame = (global.cancelRequestAnimationFrame ||
            global.webkitCancelAnimationFrame || global.webkitCancelRequestAnimationFrame ||
            global.mozCancelAnimationFrame || global.mozCancelRequestAnimationFrame ||
            global.msCancelAnimationFrame || global.msCancelRequestAnimationFrame ||
            global.oCancelAnimationFrame || global.oCancelRequestAnimationFrame ||
            global.clearTimeout);
    }
    global.THREE={};
    global.Liv={
        DiTai,Mats,GUI,TransformControls,OrbitControls,Stats,

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
        Float32BufferAttribute,
        DoubleSide,
        Matrix4,

    }
})(typeof window==="undefined"?this:window);


let {innerWidth,innerHeight}=window;
innerHeight-=5;
let rec=document.getElementById('rec');
let statsDom=document.getElementById('statsDom');

let view='p';
//排除当前操作对象之外的其它对象
let ignoreObjs=[];
//可以被选择的对象集合
let selectableFurns=[];
//可以被当前选择对象检测的对象集合
let crashableMeshs=[];
//点击时间 
let clickTime=null;
//吸力
let suction=.1;

let renderer=new WebGLRenderer();
let clearColor=new Color(0x333333);
renderer.setClearColor(clearColor);
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
let domElement=renderer.domElement;
rec.appendChild(domElement);

let scene=new Scene();

let camera=new PerspectiveCamera(45,innerWidth/innerHeight,0.1,1000);
camera.position.set(1, 1.2, 2);
camera.lookAt(scene.position);
scene.add(camera);
ignore(camera);

let orbitControls = new OrbitControls(camera);
orbitControls.target=new Vector3(.7,0,0);
orbitControls.update();
orbitControls.addEventListener( 'change', function(){
    transCtrl2.setScalar();
    render();
} );

let transCtrl2=new TransformControls2(camera,domElement,orbitControls);
scene.add(transCtrl2);
ignore(transCtrl2);

let boxGeo = new  BoxBufferGeometry(.4, .2,.8);
let m = new Matrix4();
m.makeTranslation(0.2,.1,.4);
m.applyToBufferAttribute(boxGeo.attributes.position);
let boxMat = new  MeshLambertMaterial({
    color: 0xff00ff
});
let boxMesh = new  Mesh(boxGeo, boxMat);

boxMesh.name='boxMesh';
scene.add(boxMesh);
transCtrl2.attach(boxMesh);
transCtrl2.machine(boxMesh,false);

//环境光   环境光颜色RGB成分分别和物体材质颜色RGB成分分别相乘
let ambient = new  AmbientLight(0x444444);
scene.add(ambient); //环境光对象添加到scene场景中
ignore(ambient);

// 方向光
let directionalLight = new  DirectionalLight(0xffffff, 1);
// 设置光源位置
directionalLight.position.set(3, 5, 2);
scene.add(directionalLight);
// 设置用于计算阴影的光源对象
directionalLight.castShadow = true;
// 设置计算阴影的区域，最好刚好紧密包围在对象周围
// 计算阴影的区域过大：模糊  过小：看不到或显示不完整
directionalLight.shadow.camera.near = .05;
directionalLight.shadow.camera.far = 10;
directionalLight.shadow.camera.left = -2;
directionalLight.shadow.camera.right = 2;
directionalLight.shadow.camera.top = 2;
directionalLight.shadow.camera.bottom = -2;
// 设置mapSize属性可以使阴影更清晰，不那么模糊
directionalLight.shadow.mapSize.set(2048,2048);
ignore(directionalLight);

let stats=new Stats();
rec.appendChild( stats.dom );

let axesHelper = new AxesHelper(200);
axesHelper.translateY(.001);
scene.add(axesHelper);
ignore(axesHelper);

render();
function render() {
    stats.begin();
    renderer.render(scene, camera);
    stats.end();
}

//GUI
let fttg={crtDiTai};
const gui=new GUI();
let furnsGui=gui.addFolder('分体厅柜');
furnsGui.add(fttg,'crtDiTai','地台');
furnsGui.open();

//此事件实际上可以被覆盖掉的
//transCtrl2.addEventListener( 'change', render );
//解决拖拽冲突
transCtrl2.addEventListener( 'dragging-changed', function ( event ) {
    orbitControls.enabled = ! event.value;
} );
transCtrl2.addEventListener( 'change', function ( event ) {
    render();
} );
domElement.addEventListener('mouseup',mouseupFn);
domElement.addEventListener('mousemove',mousemoveFn);
domElement.addEventListener('mousedown',mousedownFn);

function mouseupFn(){
    if(clickTime){
        let timeDist=new Date()-clickTime;
        //此逻辑可外置，亦可内置，特殊情况特殊对待
        if(timeDist<300){
            //取消对象选择
            transCtrl2.detach();
            render();
        }else{
            //借助orbit 旋转场景，物体依旧处于选择状态
            clickTime=null;
        }
    }
}
function mousemoveFn(){
    if(transCtrl2.axis){
        //如果移动轴不为空
        //检测碰撞
        checkCrash();
    }
}
function mousedownFn(event){
    if (transCtrl2.axis){return;}
    //选择对象
    let curSelectedObj=transCtrl2.getIntersectObject(event,transCtrl2.selectableFurns);
    if(curSelectedObj){
        //选择到了对象
        console.log('选择到了对象');
        let sceneChild=getSceneChild(curSelectedObj.object);
        //注册拖拽对象，就像crt 家具时那样
        orbitControls.enabled =false;

        //选择对象的差异判断
        let transObj=transCtrl2.object;
        if(transObj){
            if(sceneChild!==transObj){
                transCtrl2.detach(transObj);
                transCtrl2.attach(sceneChild);
                //updateCrashableObjs();
                render();
            }
        }else{
            transCtrl2.attach(sceneChild);
            //updateCrashableObjs();
            render();
        }
        //设置拖拽轴
        setDragAxisByView();
        //设置鼠标和相关物体的偏移距离
        transCtrl2.setMouseSubSmth(event);
    }else{
        //啥也没选择到
        console.log('啥也没选择到');
        //记下鼠标按下的事件，等鼠标抬起时，根据此事件判断是否取消选择
        clickTime=new Date();
    }
}

//要忽略的对象
function ignore(obj){
    let ind=ignoreObjs.indexOf(obj);
    if(ind===-1){
        ignoreObjs.push(obj);
    }
}
//建立地台
function crtDiTai(){
    //取消当前选择
    if(transCtrl2.object){
        transCtrl2.detach();
        render();
    }
    //建立地台
    let diTai=new DiTai(.6,.03,.322,Mats.huTao,Mats.lvMoSha);
    diTai.visible=false;
    scene.add(diTai);
    transCtrl2.attach(diTai);
    transCtrl2.machine(diTai,false);
    //设置transCtrl 的拖拽轴
    setDragAxisByView();

    let point=transCtrl2.getObjectCenter();
    transCtrl2.mouseSubObj=transCtrl2.getMouseSubObj(point);
    transCtrl2.mouseSubCenter=transCtrl2.getMouseSubCenter(point);

    if(transCtrl2.view==='p'){
        diTai.visible=false;
        transCtrl2.visible=false;
    }
    //设置可碰撞列表,将当前选择的对象排除
    //updateCrashableObjs();
}
//根据view 设置拖拽轴
function setDragAxisByView(){
    switch (transCtrl2.view){
        case 'p':
        case 't':
            transCtrl2.setAxis('xz');
            break;
        case 'f':
        case 'c':
            transCtrl2.setAxis('xy');
            break;
        case 'l':
        case 'r':
            transCtrl2.setAxis('zy');
            break;
    }
}
//获取场景之下的一级子物体
function getSceneChild(curSelectedObj){
    let sceneChildren=scene.children;
    let sceneChild=null;
    findParent(curSelectedObj);
    function findParent(obj){
        if(obj){
            if(sceneChildren.includes(obj)){
                sceneChild= obj;
            }else{
                findParent(obj.parent);
            }
        }
    }
    return sceneChild;
}

//检测碰撞
function checkCrash(){
    //分离
    let sever=false;
    //吸附偏移后的物体位置
    let newObjPos=Crash.getDragedObjPos(
        transCtrl2,
        function () {
            sever=true;
        }
    );
    //分离与否
    transCtrl2.sever=sever;
    if(sever){
        //实际物体位
        transCtrl2.object.position.copy(newObjPos);
        //控制器位
        transCtrl2.transform.position.copy(newObjPos.add(transCtrl2.transSubObj))
    }
}



