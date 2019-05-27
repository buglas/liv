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
    DirectionalLightHelper
} from 'three';

import OrbitControls from 'three-orbitcontrols'
import Stats  from './lib/Stats'
import DiTai  from './furns/DiTai'

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

let camera=new PerspectiveCamera(45,innerWidth/innerHeight,0.1,1000);
camera.position.set(-.36, 1.2, 2);
camera.lookAt(scene.position);
scene.add(camera);

let diTai=new DiTai();
scene.add(diTai);

//创建一个平面几何体作为投影面
var planeGeometry = new  PlaneGeometry(30, 20);
var planeMaterial = new  MeshLambertMaterial({
    color: 0x999999
});
// 平面网格模型作为投影面
var planeMesh = new  Mesh(planeGeometry, planeMaterial); //网格模型对象Mesh
scene.add(planeMesh); //网格模型添加到场景中
planeMesh.rotateX(-Math.PI / 2); //旋转网格模型
// 设置接收阴影的投影面
planeMesh.receiveShadow = true;
/**
 * 光源设置
 */
    //环境光   环境光颜色RGB成分分别和物体材质颜色RGB成分分别相乘
var ambient = new  AmbientLight(0x444444);
scene.add(ambient); //环境光对象添加到scene场景中

// 方向光
var directionalLight = new  DirectionalLight(0xffffff, 1);
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

let directionalLightHelper = new DirectionalLightHelper( directionalLight, 5 );
scene.add(directionalLightHelper);

let stats=new Stats();
rec.appendChild( stats.dom );

let orbitControls = new OrbitControls(camera);
renderScene();
function renderScene() {
    stats.begin();
    render.render(scene, camera);
    stats.end();
    window.requestAnimationFrame(renderScene);
}













