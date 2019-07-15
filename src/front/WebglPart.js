import {
    Scene,PerspectiveCamera,WebGLRenderer,Color,AxesHelper,BoxBufferGeometry,MeshLambertMaterial,Mesh,AmbientLight,DirectionalLight,Vector3,OrthographicCamera
} from 'three';
import OrbitControls from 'three-orbitcontrols'
import DiTai from '@/furns/DiTai'
import TransformControls2 from '@/lib/TransformControls2'
import Mats from '@/com/Mats'


export default class WebglPart{
    constructor(){
        //键盘按键的意义
        this.keys={ p:80,t:84,l:76,f:70};
        //当前视图
        this.view='p';
        //相机方向，应对平面转正交时的精度判断
        this.camDir=new Vector3();
        //包裹canvas 的视图容器
        this.viewDom=document.getElementById('view');
        //视图宽高
        this.viewW=viewDom.clientWidth;
        this.viewH=viewDom.clientHeight;

        //渲染器
        this.renderer=new WebGLRenderer();
        //canvas
        this.domElement=this.renderer.domElement;
        //背景色
        this.clearColor=new Color(0x333333);

        //场景
        this.scene=new Scene();
        //相机集合
        this.cameras={
            p:this.cameraP(),
            f:this.cameraF(),
            t:this.cameraT(),
            l:this.cameraL(),
        }
        //变换控制器
        this.transCtrl2=new TransformControls2(this.cameras[view],domElement);
        this.scene.add(transCtrl2);
        //轨道控制器
        this.orbitControls = new OrbitControls(this.cameras[view],domElement);


        this.events={
            //window 尺寸变化
            'www':()=>{},
        }
        this.init();
    }
    init(){
        //初始化渲染器
        this.initRenderer();
        //建立辅助物体
        this.crtHelpObj();
        //初始化光
        this.initLight();
    }
    //初始化渲染器
    initRenderer(){
        this.renderer.setClearColor(this.clearColor);
        this.renderer.setSize(this.viewW,this.viewH);
        this.renderer.shadowMap.enabled=true;
        this.viewDom.appendChild(this.domElement);
    }
    //建立相机
    cameraP(){
        let camera=new PerspectiveCamera(45,viewW/viewH,0.1,1000);
        camera.position.set(1,1.2,2);
        camera.lookAt(this.scene.position);
        camera.updateMatrixWorld();
        scene.add( camera );
        return camera;

    }
    cameraF(){
        return this.crtOrth(0,0,20);
    }
    cameraT(){
        return this.crtOrth(0,20,0);
    }
    cameraL(){
        return this.crtOrth(20,0,0);
    }
    //建立辅助物体
    crtHelpObj(){
        let boxGeo = new  BoxBufferGeometry(.4,.2,.8);
        let boxMat = new  MeshLambertMaterial({
            color: 0xff00ff
        });
        let boxMesh = new  Mesh(boxGeo, boxMat);
        boxMesh.name='boxMesh';
        boxMesh.translateY(.1);
        boxMesh.receiveShadow=true;
        this.scene.add(boxMesh);
        this.transCtrl2.machine(boxMesh,false);
        this.transCtrl2.attach(boxMesh);

        let axesHelper = new AxesHelper(20);
        axesHelper.translateY(.001);
        this.scene.add(axesHelper);
    }
    //初始化光
    initLight(){
        //环境光   环境光颜色RGB成分分别和物体材质颜色RGB成分分别相乘
        let ambient = new  AmbientLight(0x444444);
        this.scene.add(ambient);
        // 方向光
        let directionalLight = new  DirectionalLight(0xffffff, 1);
        // 设置光源位置
        directionalLight.position.set(3, 5, 2);
        this.scene.add(directionalLight);
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
    }

    //建立正交相机
    crtOrth(x,y,z){
        camera = new OrthographicCamera( viewW / - 2, viewW / 2, viewH / 2, viewH / - 2, 0, 1000 );
        camera.zoom=500;
        camera.position.set(x,y,z);
        camera.updateProjectionMatrix();
        scene.add( camera );
        return camera;
    }
    //获取相机方向
    getCamDir(){
        let dir=new Vector3();
        dir=this.cameras[view].getWorldDirection(dir);
        return dir;
    }


}









