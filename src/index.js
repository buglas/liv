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
//可以被当前选择对象检测的对象集合
let crashableObjs=[];
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
function mousedownFn(){
    updateSelectableObjs();
    if (transCtrl2.axis){
        return;
    }
    //选择对象
    let curSelectedObj=transCtrl2.getIntersectObject(event,selectableObjs);
    if(curSelectedObj){
        //选择到了对象
        console.log('选择到了对象');
        let sceneChild=getSceneChild(curSelectedObj.object);
        //注册拖拽对象，就像crt 家具时那样
        orbitControls.enabled =false;

        //设置偏移距离
        transCtrl2.mouseSubObj=curSelectedObj.point.sub(sceneChild.position);
        //选择对象的差异判断
        let transObj=transCtrl2.object;
        if(transObj){
            if(sceneChild!==transObj){
                transCtrl2.detach(transObj);
                transCtrl2.attach(sceneChild);
                updateCrashableObjs();
                render();
            }
        }else{
            transCtrl2.attach(sceneChild);
            updateCrashableObjs();
            render();
        }
        //设置拖拽轴
        setDragAxisByView();

        //设置可碰撞列表,将当前选择的对象排除
        //updateCrashableObjs();
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
    let center=getObjCenter(diTai);
    let offsetDist=center.sub(diTai.position);
    transCtrl2.mouseSubObj=offsetDist;
    scene.add(diTai);
    transCtrl2.attach(diTai);
    //设置transCtrl 的拖拽轴
    setDragAxisByView();
    if(transCtrl2.view==='p'){
        diTai.visible=false;
        transCtrl2.visible=false;
    }
    //设置可碰撞列表,将当前选择的对象排除
    updateCrashableObjs();


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
//列表删除当前选择的物体
function updateCrashableObjs(){
    crashableObjs=[];
    let objs=[...selectableObjs];
    let ind =objs.indexOf(transCtrl2.object);
    if(ind!=-1){
        objs.splice(ind,1);
    }
    findChild(objs);
    function findChild(objs){
        objs.forEach((ele)=>{
            if(ele.children.length){
                findChild(ele.children);
            }else{
                //计算其box 边界
                ele.box=getBox3(ele);
                crashableObjs.push(ele);
            }
        })
    }
    console.log('crashableObjs',crashableObjs);
}
//检测碰撞
function checkCrash(){
    //解析crashObjs 进行位移
    let selectedObj=transCtrl2.object;
    let axis=transCtrl2.axis;
    let crashObjs=getCrashObjs(axis);
    //console.log('crashObjs',crashObjs);
    if(axis.includes('x')){
        let offset=getOffsetDist(crashObjs,'r1l2','l1r2');
        if(offset){
            console.log('offset',offset);
            //selectedObj.translateX(offset);
            //transCtrl2.mouseSubObj.x-=offset;
            
        }
    }
    if(axis.includes('y')){
        let offset=getOffsetDist(crashObjs,'t1b2','b1t2');
        if(offset){selectedObj.translateY(offset);}
    }
    if(axis.includes('z')){
        let offset=getOffsetDist(crashObjs,'f1c2','c1f2');
        if(offset){selectedObj.translateZ(offset);}
    }
}
function getOffsetDist(crashObjs,r1l2,l1r2){
    let ox=null;
    let o1=crashObjs[r1l2][0];
    let o2=crashObjs[l1r2][0];
    //console.log('o1',o1);
    //console.log('o2',o2);
    if(o1!=undefined&&o2!=undefined){
        if(Math.abs(o1.distance)>Math.abs(o2.distance)){
            ox=o2.distance;
        }else{
            ox=o1.distance;
        }
    }else if(o1!=undefined){
        ox=o1.distance;
    }else if(o2!=undefined){
        ox=o2.distance;
    }
    return ox;
}
function getCrashObjs(axis){
    let selectedObj=transCtrl2.object;
    selectedObj.box=getBox3(selectedObj);
    let {min,max}=selectedObj.box;
    let [l1,b1,c1,r1,t1,f1]=[min.x,min.y,min.z,max.x,max.y,max.z];
    //console.log(l1,b1,c1,r1,t1,f1);
    //建立碰撞信息对象
    let crashObjs={
        r1l2:[],
        l1r2:[],
        t1b2:[],
        b1t2:[],
        f1c2:[],
        c1f2:[],
    }
    //先判断x 轴
    crashableObjs.forEach((ele,ind)=>{
        let {min,max}=ele.box;
        let [l2,b2,c2,r2,t2,f2]=[min.x,min.y,min.z,max.x,max.y,max.z];
        let bt=t1<t2&&t1>b2 || b1<t2&&b1>b2||t2<t1&&t2>b1 || b2<t1&&b2>b1;
        let cf=f1<f2&&f1>c2 || c1<f2&&c1>c2||f2<f1&&f2>c1 || c2<f1&&c2>c1;
        let lr=l1<r2&&l1>l2 || r1<r2&&r1>l2||l2<r1&&l2>l1 || r2<r1&&r2>l1;

        let r1l2Dist= l2-r1;
        let l1r2Dist= r2-l1;
        let t1b2Dist= b2-t1;
        let b1t2Dist= t2-b1;
        let f1c2Dist= c2-f1;
        let c1f2Dist= f2-c1;
        if(axis.includes('x')){
            //r 面
            crashObjAdd(crashObjs['r1l2'],ele,ind,r1l2Dist,bt,cf,suction);
            //l 面
            crashObjAdd(crashObjs['l1r2'],ele,ind,l1r2Dist,bt,cf,suction);
        }
        if(axis.includes('y')){
            //t 面
            crashObjAdd(crashObjs['t1b2'],ele,ind,t1b2Dist,lr,cf,suction);
            //b 面
            crashObjAdd(crashObjs['b1t2'],ele,ind,b1t2Dist,lr,cf,suction);
        }
        if(axis.includes('z')){
            //f 面
            crashObjAdd(crashObjs['f1c2'],ele,ind,f1c2Dist,lr,bt,suction);
            //c 面
            crashObjAdd(crashObjs['c1f2'],ele,ind,c1f2Dist,lr,bt,suction);
        }
    })
    //console.log('crashObjs',crashObjs);
    return crashObjs;
}
function crashObjAdd(r1l2,ele,ind,dist,bt,cf,suction){
    let distAbs=Math.abs(dist);
    if( (distAbs<suction)&&bt&&cf){
        let obj={object:ele,distance:dist};
        let len=r1l2.length;
        if(len){
            if(Math.abs(r1l2[len-1].distance)>distAbs){
                r1l2.unshift(obj);
            }else{
                r1l2.push(obj);
            }
        }else{
            r1l2[0]=obj;
        }
    }
}
function getBox3(object){
    let box3=new Box3();
    box3.setFromObject(object);
    return box3;
}


