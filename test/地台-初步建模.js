
import {
    Scene,PerspectiveCamera,WebGLRenderer,Color,
    Geometry,
    AxesHelper,PlaneGeometry,PlaneBufferGeometry,SphereGeometry,BoxGeometry,CylinderGeometry,
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
} from 'three';

import OrbitControls from 'three-orbitcontrols'

let {innerWidth,innerHeight}=window;
innerHeight-=30;
let rec=document.getElementById('rec');
let statsDom=document.getElementById('statsDom');

let render=new WebGLRenderer();
let clearColor=new Color(0x333333);
render.setClearColor(clearColor);
render.setSize(innerWidth,innerHeight);
render.shadowMap.enabled=true;
rec.appendChild(render.domElement);

let scene=new Scene();

let camera=new PerspectiveCamera(45,innerWidth/innerHeight,0.1,10000);
camera.position.set(-360, 1200, 2000);
camera.lookAt(scene.position);
scene.add(camera);

//地台面板尺寸
let [w,h,d]=[600,300,322];

//铝框收缩
const ls=12;
let [lw,lh,ld]=[w-ls*2,25,d-ls*2];

let geoP=new PlaneBufferGeometry(4000,4000);
let matP=new MeshLambertMaterial({color:0x999999});
let meshP=new Mesh(geoP,matP);
meshP.receiveShadow=true;
meshP.castShadow=true;
meshP.rotateX(-Math.PI/2);
scene.add(meshP);

let group=new Group();
let geo=new BoxBufferGeometry(lw, lh, ld);
let mat=new MeshPhongMaterial({color:0xff9600});
let mesh=new Mesh(geo,mat);
mesh.receiveShadow=true;
mesh.castShadow=true;
//group.add(mesh);
let geo2=new BoxBufferGeometry(w, h, d);
let mat2=new MeshLambertMaterial({color:0xff9600});
let mesh2=new Mesh(geo2,mat2);
mesh2.receiveShadow=true;
mesh2.castShadow=true;
mesh2.translateY(150);
group.add(mesh2);
scene.add(group);

let axesHelper = new AxesHelper(200);
scene.add(axesHelper);

let directionalLight=new DirectionalLight(0xffffff);
// 设置光源位置
directionalLight.position.set(60, 100, 40);
scene.add(directionalLight);
// 设置用于计算阴影的光源对象
directionalLight.castShadow = true;
// 设置计算阴影的区域，最好刚好紧密包围在对象周围
// 计算阴影的区域过大：模糊  过小：看不到或显示不完整
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 300;
directionalLight.shadow.camera.left = -50;
directionalLight.shadow.camera.right = 50;
directionalLight.shadow.camera.top = 200;
directionalLight.shadow.camera.bottom = -100;


let orbitControls = new OrbitControls(camera);
renderScene();
function renderScene() {
    render.render(scene, camera);
    window.requestAnimationFrame(renderScene);
}













