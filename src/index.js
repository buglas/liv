import * as THREE from 'three';

import OrbitControls from 'three-orbitcontrols'
import {GUI} from 'dat.gui'
import TransformControls from '@/lib/TransformControls'
import Stats  from '@/lib/Stats'
import DiTai from '@/furns/DiTai'
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
        Box3,Box3Helper

    }
})(typeof window==="undefined"?this:window);

let {innerWidth,innerHeight}=window;
innerHeight-=5;
let rec=document.getElementById('rec');
let statsDom=document.getElementById('statsDom');

let view='p'; //p
let crting=false;
let customDraging=false; //是否在执行自定义的拖拽
let selectedObj=null; //正在移动的物体
let ignoreObjs=[]; //排除当前操作对象之外的其它对象
let selectableObjs=[]; //可以被选择的对象集合
let crashableObjs=[]; //可以被当前选择对象检测的对象集合
let raycaster = new Raycaster();
let transformControls; //拖拽器
let offsetDist=new Vector3(); //鼠标选择物体时的位置和物体位置的差
let suction=.1; //吸力

let renderer=new WebGLRenderer();
let domElement=renderer.domElement;
let clearColor=new Color(0x333333);
renderer.setClearColor(clearColor);
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
rec.appendChild(renderer.domElement);

let scene=new Scene();

//创建一个平面几何体作为投影面
let planeGeometry = new  PlaneGeometry(30, 20);
let planeMaterial = new  MeshLambertMaterial({
    color: 0x999999
});
// 平面网格模型作为投影面
let planeMesh = new  Mesh(planeGeometry, planeMaterial); //网格模型对象Mesh
planeMesh.rotateX(-Math.PI / 2); //旋转网格模型
// 设置接收阴影的投影面
planeMesh.receiveShadow = true;
//scene.add(planeMesh); //网格模型添加到场景中

let axesHelper = new AxesHelper(200);
axesHelper.translateY(.001);
scene.add(axesHelper);
ignoreObjsInclude(axesHelper);

//环境光   环境光颜色RGB成分分别和物体材质颜色RGB成分分别相乘
let ambient = new  AmbientLight(0x444444);
scene.add(ambient); //环境光对象添加到scene场景中
ignoreObjsInclude(ambient);

// 方向光
let directionalLight = new  DirectionalLight(0xffffff, 1);
// 设置光源位置
directionalLight.position.set(3, 5, 2);
scene.add(directionalLight);
ignoreObjsInclude(directionalLight);
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

let directionalLightHelper = new DirectionalLightHelper( directionalLight, 5 );
scene.add(directionalLightHelper);
ignoreObjsInclude(directionalLightHelper);

let camera=new PerspectiveCamera(45,innerWidth/innerHeight,0.1,1000);
camera.position.set(-.36, 1.2, 2);
camera.lookAt(scene.position);
scene.add(camera);
ignoreObjsInclude(camera);

let stats=new Stats();
rec.appendChild( stats.dom );

let orbitControls = new OrbitControls(camera);
orbitControls.target=new Vector3(.7,0,0);
orbitControls.update();
orbitControls.addEventListener( 'change', render );

transformControls = new TransformControls( camera, rec );
scene.add( transformControls );
ignoreObjsInclude(transformControls);

let boxGeo = new  BoxBufferGeometry(.4, .2,.4);
let boxMat = new  MeshLambertMaterial({
    color: 0xffff00
});
let boxMesh = new  Mesh(boxGeo, boxMat);
boxMesh.translateZ(-0.2);
boxMesh.translateX(2);
boxMesh.name='boxMesh';
scene.add(boxMesh);


let box3=new Box3();
box3.setFromObject(boxMesh);

//transformControls.attach(boxMesh);
/*let diTai=new DiTai(.6,.03,.322,Mats.huTao,Mats.lvMoSha);
scene.add(diTai);
addRenderForObj(diTai);
transformControls.attach(diTai);
selectedObj=diTai;
let center=getObjCenter(diTai);
offsetDist=center.sub(diTai.position);*/

/*
setTimeout(function(){
    //获取物体所在的
    selectedObj.translateY(0.2);
    //重新计算偏移
    //获取鼠标点击处和物体
    offsetDist.y-=0.2;
    render();
},3000)
*/



updateValidObjs();
render();



transformControls.addEventListener( 'change', render );
transformControls.addEventListener( 'dragging-changed', function ( event ) {
    orbitControls.enabled = ! event.value;
} );



let fttg={crtDiTai};
const gui=new GUI();
let furnsGui=gui.addFolder('分体厅柜');
furnsGui.add(fttg,'crtDiTai','地台');
furnsGui.open();



let mouseDownTime=null;
rec.addEventListener('mouseup',mouseupFn);
rec.addEventListener('mousemove',mousemoveFn);
rec.addEventListener('mousedown',mousedownFn);

function mouseupFn(){
    if(crting){
        //如果有创建状态的对象
        //在鼠标抬起时将此对象选择
        transformControls.attach(selectedObj);
        crting=false;
        render();
    }
    if(mouseDownTime){
        let timeDist=new Date()-mouseDownTime;
        console.log('timeDist',timeDist);
        if(timeDist<300){
            transformControls.detach(selectedObj);
            selectedObj=null;
            render();
        }else{
            mouseDownTime=null;
        }
    }
    if(customDraging){
        customDraging=false;
        orbitControls.enabled =true;
    }


}
function mousemoveFn(event){
    //如果选择了家具，手动移动已经创建的家具
    if(selectedObj){
        //如果选择了家具
        if(customDraging){
            //如是在执行自定义的拖拽
            moveCreatedObj(event);
            //检测碰撞
            checkCrash();
        }else{
            if(transformControls.axis){
                //如果移动轴不为空
                //检测碰撞
                checkCrash();
            }
        }
        render();
    }

}
function mousedownFn(event){
    if(customDraging){
        //移动的家具是创建中的
        customDraging=false;
    }
    //有变换物体
    let transformObj=transformControls.object;
    if(transformObj){
        if(transformControls.axis){
            //选择了操作轴
            return;
        }else{
            //没选择操作轴
            console.log('没选择操作轴');
            //选择对象
            let curSelectedObj=getSelectedObj(event);
            if(curSelectedObj){
                //选择到了对象
                console.log('选择到了对象');
                let sceneChild=getSceneChild(curSelectedObj.object);
                //注册拖拽对象，就像crt 家具时那样
                orbitControls.enabled =false;
                customDraging=true;
                console.log('curSelectedObj',curSelectedObj);
                //设置偏移距离
                offsetDist=curSelectedObj.point.sub(sceneChild.position);
                //选择对象的差异判断
                if(sceneChild===selectedObj){
                    return;
                }else{
                    transformControls.detach(selectedObj);
                    transformControls.attach(sceneChild);
                    selectedObj=sceneChild;
                }
                //设置可碰撞列表,将当前选择的对象排除
                updateCrashableObjs();
            }else{
                //啥也没选择到
                console.log('啥也没选择到');
                //记下鼠标按下的事件，等鼠标抬起时，根据此事件判断是否取消选择
                mouseDownTime=new Date();
            }
        }
    }else{
        //没有选择物体
        //选择对象
        let curSelectedObj=getSelectedObj(event);
        if(curSelectedObj){
            //如果有选择对象，就选择
            let sceneChild=getSceneChild(curSelectedObj.object);
            transformControls.attach(sceneChild);
            selectedObj=sceneChild;
            //设置偏移距离
            offsetDist=curSelectedObj.point.sub(sceneChild.position);
            //设置可碰撞列表,将当前选择的对象排除
            updateCrashableObjs();
        }
    }
    render();
}

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
function getSelectedObj(event){
    let pointer=getPointer( event,renderer.domElement);
    //获取射线
    raycaster.setFromCamera( pointer, camera );
    var intersects = raycaster.intersectObjects( selectableObjs,true);
    console.log('intersects',intersects);
    return intersects[0];
}
//有效检测的排除
function ignoreObjsExclude(obj){
    let ind=ignoreObjs.indexOf(obj);
    if(ind!=-1){
        ignoreObjs.splice(ind,1);
    }
}
//有效监测的置入
function ignoreObjsInclude(obj){
    let ind=ignoreObjs.indexOf(obj);
    if(ind===-1){
        ignoreObjs.push(obj);
    }
}
function updateValidObjs(){
    selectableObjs=[];
    scene.children.forEach((ele)=>{
        if(!ignoreObjs.includes(ele)){
            selectableObjs.push(ele)
        }
    })
}
//设置可碰撞列表，以mesh 为单位分解，计算其边界
//列表添加当前选择的物体
function crashableObjsAdd(){

}
//列表删除当前选择的物体
function updateCrashableObjs(){
    crashableObjs=[];
    let objs=[...selectableObjs];
    let ind =objs.indexOf(selectedObj);
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
    getCrashObjs();
}
function getCrashObjs(){
    selectedObj.box=getBox3(selectedObj);
    let {min,max}=selectedObj.box;
    let [l1,b1,c1,r1,t1,f1]=[min.x,min.y,min.z,max.x,max.y,max.z];
    let min1=selectedObj.box.min;
    let max1=selectedObj.box.max;
    //console.log('r1',r1);
    //建立距离，遍历对比，取最小值
    //let r1l2=l1r2=t1b2=b1t2=f1c2=c1f2=null;
    //建立碰撞信息对象
    let crashObjs={
        r1l2:[],
        l1r2:[],
        t1b2:[],
        b1t2:[],
        f1c2:[],
        c1f2:[],
    }
    //let crashObjs={};
    //先判断x 轴
    crashableObjs.forEach((ele,ind)=>{
        let {min,max}=ele.box;
        let min2=ele.box.min;
        let max2=ele.box.max;
        let [l2,b2,c2,r2,t2,f2]=[min.x,min.y,min.z,max.x,max.y,max.z];
        let bt=t1<t2&&t1>b2 || b1<t2&&b1>b2;
        let cf=f1<f2&&f1>c2 || c1<f2&&c1>c2;
        let lr=l1<r2&&l1>l2 || r1<r2&&r1>l2;
        let r1l2Dist=Math.abs(r1-l2);
        let l1r2Dist=Math.abs(l1-r2);
        let t1b2Dist=Math.abs(t1-b2);
        let b1t2Dist=Math.abs(b1-t2);
        let f1c2Dist=Math.abs(f1-c2);
        let c1f2Dist=Math.abs(c1-f2);
        //r 面
        crashObjAdd(crashObjs['r1l2'],ele,r1l2Dist,bt,cf,suction);
        //l 面
        crashObjAdd(crashObjs['l1r2'],ele,l1r2Dist,bt,cf,suction);
        //t 面
        crashObjAdd(crashObjs['t1b2'],ele,t1b2Dist,lr,cf,suction);
        //b 面
        crashObjAdd(crashObjs['b1t2'],ele,b1t2Dist,lr,cf,suction);
        //f 面
        crashObjAdd(crashObjs['f1c2'],ele,f1c2Dist,lr,bt,suction);
        //c 面
        crashObjAdd(crashObjs['c1f2'],ele,c1f2Dist,lr,bt,suction);


    })
}
function crashObjAdd(r1l2,ele,dist,bt,cf,suction){
    if( (dist<suction)&&bt&&cf){
        console.log('dist',dist);
        let obj={object:ele,distance:dist};
        if(r1l2.length){
            if(r1l2[ind-1].distance>dist){
                r1l2.unshift(obj);
            }else{
                r1l2.push(obj);
            }
        }else{
            r1l2[0]=obj;

        }
    }
}
function checkPlaneCrash(r1,l2,t1,t2,b1,b2,f1,f2,c1,c2,suction){
    let r1l2=r1-l2;
    //console.log('r1l2',r1l2);
    if( (r1l2<suction)&&(t1<t2&&t1>b2 || b1<t2&&b1>b2)&&(f1<f2&&f1>c2 || c1<f2&&c1>c2) ){
        return r1l2;
    }else{
        return null;
    }
}
//建立地台
function crtDiTai(){
    let diTai=new DiTai(.6,.03,.322,Mats.huTao,Mats.lvMoSha);
    diTai.visible=false;
    scene.add(diTai);

    customDraging=true;
    selectedObj=diTai;
    ignoreObjsInclude(transformControls);
    updateValidObjs();
    let center=getObjCenter(diTai);
    offsetDist=center.sub(diTai.position);
    crting=true;

    //若有选择的对象，便将对象的操作轴消掉
    transformControls.detach(transformControls.object);

    //设置可碰撞列表,将当前选择的对象排除
    updateCrashableObjs();

    render();
}
//设置所选对象的偏移

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
//移动已经创建的物体
function moveCreatedObj(event){
    let pointer=getPointer( event,renderer.domElement);
    //获取射线
    raycaster.setFromCamera( pointer, camera );
    let ray=raycaster.ray;
    //地面
    let plane=new Plane(new Vector3(0,1,0));
    //水平面时，Y 轴的相对移动会被这一加一减抵消为0，position 是相对位移，y 为0 就是对象的高度位置不变
    //因此，物体的位置变化就只剩下了x,y
    //focuse 焦点随鼠标二变；
    //offsetDist 恒定不变；除非它脱离的操作轴位移。因为offsetDist 形成的根本就是操作轴减对象的position
    let y=offsetDist.y+selectedObj.position.y;
    plane.translate(new Vector3(0,y,0));
    //焦点及其是否有焦点
    let focus=new Vector3();
    focus=ray.intersectPlane(plane,focus);
    //若鼠标点击的位置在视平线以上，相机到鼠标的射线是不会和地面产生焦点的
    if(focus){
        selectedObj.visible=true;
        //鼠标选择点减去偏移量
        //
        selectedObj.position.copy(focus.sub(offsetDist));
        selectedObj.updateMatrix();
    }else{
        selectedObj.visible=false;
    }
}
//获取鼠标在屏幕中[-1,1] 的点
function getPointer( event,domElement) {
    var rect = domElement.getBoundingClientRect();
    return {
        x: ( event.clientX - rect.left ) / rect.width * 2 - 1,
        y: - ( event.clientY - rect.top ) / rect.height * 2 + 1,
        button: event.button
    };
}
//为基层元素添加渲染方法
function addRenderForObj(object) {
    let children=object.children;
    if(children.length){
        children.forEach((ele)=>{
            addRenderForObj(ele);
        });
    }else{
        object.render=render;
    }
}

function render() {
    stats.begin();
    renderer.render(scene, camera);
    stats.end();
}
