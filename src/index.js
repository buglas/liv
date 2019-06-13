import * as THREE from 'three';

import OrbitControls from 'three-orbitcontrols'
import {GUI} from 'dat.gui'
import TransformControls from '@/lib/TransformControls'
import Stats  from '@/lib/Stats'
import DiTai from '@/furns/DiTai'
import TransformControls2 from '@/lib/TransformControls2'
import Mats from '@/com/Mats'


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
let selectableObjs=[];
//要创建的对象
let creatingObj=null;

let renderer=new WebGLRenderer();
let clearColor=new Color(0x333333);
renderer.setClearColor(clearColor);
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
let domElement=renderer.domElement;
rec.appendChild(domElement);

let scene=new Scene();

let camera=new PerspectiveCamera(45,innerWidth/innerHeight,0.1,1000);
camera.position.set(-.36, 1.2, 2);
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

updateSelectableObjs();
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
transCtrl2.addEventListener( 'change', render );
//解决拖拽冲突
transCtrl2.addEventListener( 'dragging-changed', function ( event ) {
    orbitControls.enabled = ! event.value;
} );

domElement.addEventListener('mouseup',mouseupFn);
domElement.addEventListener('mousemove',mousemoveFn);
domElement.addEventListener('mousedown',mousedownFn);
//domElement.addEventListener('mouseover',mouseoverFn);

function mouseupFn(){
    //render();
}
function mousemoveFn(){
    
}
function mousedownFn(){
    if (transCtrl2.axis){
        //render();
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
    creatingObj=null;
    //建立地台
    let diTai=new DiTai(.6,.03,.322,Mats.huTao,Mats.lvMoSha);
    diTai.visible=false;
    let center=getObjCenter(diTai);
    let offsetDist=center.sub(diTai.position);
    transCtrl2.mouseSubObj=offsetDist;
    scene.add(diTai);
    transCtrl2.attach(diTai);
    //设置transCtrl 的拖拽轴
    setDragAxisByView();
    //设置可碰撞列表,将当前选择的对象排除
    //updateCrashableObjs();

    creatingObj='diTai';

}

function mouseoverFn(){
    if(creatingObj){
        creatingObj=null;
        //建立地台
        let diTai=new DiTai(.6,.03,.322,Mats.huTao,Mats.lvMoSha);
        diTai.visible=false;
        let center=getObjCenter(diTai);
        let offsetDist=center.sub(diTai.position);
        transCtrl2.mouseSubObj=offsetDist;
        scene.add(diTai);
        transCtrl2.attach(diTai);
        //设置transCtrl 的拖拽轴
        setDragAxisByView();
        //设置可碰撞列表,将当前选择的对象排除
        //updateCrashableObjs();
    }

}
//根据view 设置拖拽轴
function setDragAxisByView(){
    switch (view){
        case 'p':
        case 't':
            transCtrl2.axis='xz';
            break;
        case 'f':
        case 'c':
            transCtrl2.axis='xy';
            break;
        case 'l':
        case 'r':
            transCtrl2.axis='zy';
            break;
    }
}
//更新可选对象的集合
function updateSelectableObjs(){
    selectableObjs=[];
    scene.children.forEach((ele)=>{
        if(!ignoreObjs.includes(ele)){
            selectableObjs.push(ele)
        }
    })
}
//获取对象的中心点
function getObjCenter(object){
    let box3=getBox3(object);
    let center=new THREE.Vector3();
    center=box3.getCenter(center);
    return center;
}
function getBox3(object){
    let box3=new THREE.Box3();
    box3.setFromObject(object);
    return box3;
}


