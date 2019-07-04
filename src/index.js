import * as THREE from 'three';

import OrbitControls from 'three-orbitcontrols'
import {GUI} from 'dat.gui'
import TransformControls from '@/lib/TransformControls'
import Stats  from '@/lib/Stats'
import DiTai from '@/furns/DiTai'
import TransformControls2 from '@/lib/TransformControls2'
import OrbitControls2 from '@/lib/OrbitControls2'
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
    Matrix4,
    ArrayCamera,
    Vector4,
    OrthographicCamera
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
        ArrayCamera,
        Vector4

    }
})(typeof window==="undefined"?this:window);

let {innerWidth,innerHeight}=window;
innerHeight-=5;
let rec=document.getElementById('rec');
let statsDom=document.getElementById('statsDom');

let view='p';
let camDir=new Vector3();

let renderer=new WebGLRenderer();
let clearColor=new Color(0x333333);
renderer.setClearColor(clearColor);
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
let domElement=renderer.domElement;
rec.appendChild(domElement);

let scene=new Scene();
let cameras={
    p:cameraP(),
    f:cameraF(),
}
let camera=null;

let transCtrl2=new TransformControls2(cameras[view],domElement);
scene.add(transCtrl2);

let orbitControls = new OrbitControls(cameras[view]);
//orbitControls.target=new Vector3(.7,0,0);
//orbitControls.update();
orbitControls.addEventListener( 'change', function(){
    transCtrl2.setScalar();
    render();
});
orbitControls.addEventListener( 'end', function(event){
    //判断相机旋转
    console.log(camDir);
    console.log(getCamDir());
    if(view!=='p'&&!camDir.equals(getCamDir())){
        console.log('www');
    }
    

});


setTimeout(function(){
    changeView('f');
},1000)
//切换视图
function changeView(v){
    if(v===view){return}
    view=v;
    transCtrl2.view=v;
    transCtrl2.camera=cameras[view];
    transCtrl2.setScalar();
    transCtrl2.setInitPlane();
    //orbitControls.reset();
    orbitControls.object=cameras[view];
    //存储相机方向，用于正交平面转正交透视的判断
    camDir=getCamDir();
    render();
}


let boxGeo = new  BoxBufferGeometry(.4,.2,.8);
/*let m = new Matrix4();
m.makeTranslation(0.2,.1,.4);
m.applyToBufferAttribute(boxGeo.attributes.position);*/
let boxMat = new  MeshLambertMaterial({
    color: 0xff00ff
});
let boxMesh = new  Mesh(boxGeo, boxMat);
boxMesh.name='boxMesh';
boxMesh.receiveShadow=true;
scene.add(boxMesh);
transCtrl2.machine(boxMesh,false);
transCtrl2.attach(boxMesh);


//环境光   环境光颜色RGB成分分别和物体材质颜色RGB成分分别相乘
let ambient = new  AmbientLight(0x444444);
scene.add(ambient); //环境光对象添加到scene场景中

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

let stats=new Stats();
rec.appendChild( stats.dom );

let axesHelper = new AxesHelper(20);
axesHelper.translateY(.001);
scene.add(axesHelper);

render();
function render() {
    stats.begin();
    renderer.render(scene, cameras[view]);
    stats.end();
}

//GUI
let fttg={crtDiTai};
const gui=new GUI();
let furnsGui=gui.addFolder('分体厅柜');
furnsGui.add(fttg,'crtDiTai','地台');
furnsGui.open();

//此事件实际上可以被覆盖掉的
//解决拖拽冲突
transCtrl2.addEventListener( 'dragging-changed', function ( event ) {
    orbitControls.enabled = ! event.value;
} );
transCtrl2.addEventListener( 'change', function ( event ) {
    render();
} );

//建立地台
function crtDiTai(){
    //取消当前选择
    if(transCtrl2.object){
        transCtrl2.detach();
        render();
    }
    //建立地台
    //.6,.03,.322
    let [w,h,d]=[.6,.03,.322]
    let diTai=new DiTai(w,h,d,Mats.huTao,Mats.lvMoSha);
    diTai.visible=false;
    scene.add(diTai);
    //应该把新建对象也合到此方法里
    transCtrl2.attach(diTai);

    transCtrl2.machine(diTai,false);
    //设置transCtrl 的拖拽轴
    transCtrl2.setDragAxisByView();
    let point=transCtrl2.getObjectCenter();
    transCtrl2.mouseSubObj=transCtrl2.getMouseSubObj(point);
    transCtrl2.mouseSubCenter=transCtrl2.getMouseSubCenter(point);
    transCtrl2.mouseSubTrans=transCtrl2.getMouseSubTrans(point);
    if(transCtrl2.view==='p'){
        diTai.visible=false;
        transCtrl2.visible=false;
    }
}

//建立相机
function cameraP(){
    let camera=new PerspectiveCamera(45,innerWidth/innerHeight,0.1,1000);
    camera.name='camera'
    camera.position.set(1,1.2,2);
    camera.lookAt(scene.position);
    camera.updateMatrixWorld();
    scene.add( camera );
    return camera;

}
function cameraF(){
    
    return crtOrth(0,0,200);
}
function crtOrth(x,y,z){
    camera = new OrthographicCamera( innerWidth / - 2, innerWidth / 2, innerHeight / 2, innerHeight / - 2, 0, 1000 );
    camera.name='camera'
    camera.zoom=500;
    camera.position.set(x,y,z);
    camera.updateProjectionMatrix();
    scene.add( camera );
    
    return camera;
}
function getCamDir(){
    let dir=new Vector3();
    dir=cameras[view].getWorldDirection(dir);
    return dir;
}
