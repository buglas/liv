import {
    Scene,PerspectiveCamera,WebGLRenderer,Color,AxesHelper,BoxBufferGeometry,MeshLambertMaterial,Mesh,AmbientLight,DirectionalLight,Vector3,OrthographicCamera
} from 'three';

import OrbitControls from 'three-orbitcontrols'
import {GUI} from 'dat.gui'
import DiTai from '@/furns/DiTai'
import TransformControls2 from '@/lib/TransformControls2'
import Mats from '@/com/Mats'


//按键
// p: 80, t: 84, b: 66, r: 82,l: 76,f: 70,c: 67
let keys={ p:80,t:84,l:76,f:70};
let view='p';
let camDir=new Vector3();
let viewDom=document.getElementById('view');
let [viewW,viewH]=[viewDom.clientWidth,viewDom.clientHeight];

let renderer=new WebGLRenderer();
let clearColor=new Color(0x333333);
renderer.setClearColor(clearColor);
renderer.setSize(viewW,viewH);
renderer.shadowMap.enabled=true;
let domElement=renderer.domElement;
viewDom.appendChild(domElement);

let scene=new Scene();
let cameras={
    p:cameraP(),
    f:cameraF(),
    t:cameraT(),
    l:cameraL(),
}


let transCtrl2=new TransformControls2(cameras[view],domElement);
scene.add(transCtrl2);

let orbitControls = new OrbitControls(cameras[view],domElement);

let boxGeo = new  BoxBufferGeometry(.4,.2,.8);
let boxMat = new  MeshLambertMaterial({
    color: 0xff00ff
});
let boxMesh = new  Mesh(boxGeo, boxMat);
boxMesh.name='boxMesh';
boxMesh.translateY(.1);
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

let axesHelper = new AxesHelper(20);
axesHelper.translateY(.001);
scene.add(axesHelper);

render();
function render() {
    renderer.render(scene, cameras[view]);
}



//解决拖拽冲突
transCtrl2.addEventListener( 'dragging-changed', function ( event ) {
    orbitControls.enabled = ! event.value;
} );
//拖拽时，实时渲染
transCtrl2.addEventListener( 'change', function ( event ) {
    render();
} );
//轨道控制器旋转实时监听变化
orbitControls.addEventListener( 'change', function(){
    transCtrl2.setScalar();
    render();
});
//针对在平面图中旋转相机时出现的正交相机，将视图切换为透视状态
//轨道控制器，拖拽结束后，根据相机方向变化判断旋转轨道
orbitControls.addEventListener( 'end', function(event){
    //判断相机旋转
    let curCamDir=getCamDir();
    let cos=1-Math.abs(camDir.dot( curCamDir));
    if(view!=='p'&&cos>0.000001){
        transCtrl2.view='p';
        transCtrl2.setInitPlane();
    }
});
//鼠标抬起监听
window.addEventListener('keydown',function (event) {
    if(!event.shiftKey&&!event.ctrlKey&&!event.altKey&&!event.metaKey) {
        switch (event.keyCode) {
            case keys.t:
                changeView('t');
                break;
            case keys.p:
                changeView('p');
                break;
            case keys.l:
                changeView('l');
                break;
            case keys.f:
                changeView('f');
                break;
        }
    }

});
//窗口变换
window.addEventListener( 'resize', function(event){
    [viewW,viewH]=[viewDom.clientWidth,viewDom.clientHeight];
    cameras[view].aspect = viewW/viewH;
    cameras[view].updateProjectionMatrix();
    renderer.setSize( viewW, viewH );
    render();
} );

//切换视图
function changeView(v){
    if(v===view){return}
    view=v;
    transCtrl2.view=v;
    transCtrl2.camera=cameras[view];
    transCtrl2.setScalar();
    transCtrl2.setInitPlane();
    //指定轨道的相机，并更新
    orbitControls.object=cameras[view];
    orbitControls.update();
    //存储相机方向，用于正交平面转正交透视的判断
    camDir=getCamDir();

    render();
}

//建立地台
// curFurn()
methods.crtFurn=function(){
    console.log('methods.crtFurn');
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
    let camera=new PerspectiveCamera(45,viewW/viewH,0.1,1000);
    camera.position.set(1,1.2,2);
    camera.lookAt(scene.position);
    camera.updateMatrixWorld();
    scene.add( camera );
    return camera;

}
function cameraF(){
    return crtOrth(0,0,20);
}
function cameraT(){
    return crtOrth(0,20,0);
}
function cameraL(){
    return crtOrth(20,0,0);
}
function crtOrth(x,y,z){
    let camera = new OrthographicCamera( viewW / - 2, viewW / 2, viewH / 2, viewH / - 2, 0, 1000 );
    camera.zoom=500;
    camera.position.set(x,y,z);
    camera.updateProjectionMatrix();
    scene.add( camera );
    return camera;
}
//获取相机方向
function getCamDir(){
    let dir=new Vector3();
    dir=cameras[view].getWorldDirection(dir);
    return dir;
}