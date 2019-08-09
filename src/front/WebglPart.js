import {
    Scene,
    PerspectiveCamera,
    WebGLRenderer,
    Color,
    AxesHelper,
    BoxBufferGeometry,
    MeshLambertMaterial,
    Mesh,
    AmbientLight,
    DirectionalLight,
    Vector3,
    OrthographicCamera,
    TorusBufferGeometry,
    MeshBasicMaterial,
    TextureLoader, Box3Helper,
    LineBasicMaterial
} from 'three';
import OrbitControls from 'three-orbitcontrols'
import DiTai from '@/furns/DiTai'
import TransformControls2 from '@/lib/TransformControls2'
import BoxMat from '@/com/BoxMat'
import Tool from "@/com/Tool";
import MatTool from "@/com/MatTool";
import Mats from "@/com/Mats";
import BoxMesh from "@/Objects/BoxMesh";
const {parseUnit}=Tool;



export default class WebglPart{
    constructor(viewDom){
        //键盘按键的意义
        this.keys={ p:80,t:84,l:76,f:70};

        //当前视图
        this.view='p';
        //相机方向，应对平面转正交时的精度判断
        this.camDir=new Vector3();
        //包裹canvas 的视图容器
        this.viewDom=viewDom;
        //视图宽高,x先不考虑viewDom 为window 的情况
        this.viewW=null;
        this.viewH=null;

        //渲染器
        this.renderer=new WebGLRenderer();
        //canvas
        this.domElement=this.renderer.domElement;
        //背景色
        this.clearColor=new Color(0x333333);

        //场景
        this.scene=new Scene();
        //当前相机
        this.camera=null;
        //变换控制器
        this.transCtrl2=null;
        //轨道控制器
        this.orbitCtrl = null;
        //相机数据
        this.camerasAttr={
          p:{
              cameraPos:new Vector3(parseUnit(1000),parseUnit(1200),parseUnit(2000)),
              targetPos:this.scene.position,
          },
          f:{
              cameraPos:new Vector3(parseUnit(0),parseUnit(0),parseUnit(5000)),
              targetPos:this.scene.position,
              zoom:500,
          },
          t:{
              cameraPos:new Vector3(parseUnit(0),parseUnit(5000),parseUnit(0)),
              targetPos:this.scene.position,
              zoom:500,
          },
          l:{
              cameraPos:new Vector3(parseUnit(5000),parseUnit(0),parseUnit(0)),
              targetPos:this.scene.position,
              zoom:500,
          },
        };

        //视图改变时，关联视图的回调方法
        this.onViewChange=()=>{}
    }
    init(){
        //容器尺寸
        this.viewW=this.viewDom.clientWidth;
        this.viewH=this.viewDom.clientHeight;
        //初始化渲染器
        this.initRenderer();
        //场景
        this.scene=new Scene();
        this.camera=this.getCamera('p');
        //变换控制器
        this.transCtrl2=new TransformControls2(this.camera,this.domElement);
        this.scene.add(this.transCtrl2);
        //轨道控制器
        this.orbitCtrl = new OrbitControls(this.camera,this.domElement);
        //建立辅助物体
        this.crtHelpObj();
        //测试模型
        this.test();
        //初始化光
        this.initLight();
        //渲染
        this.render();
        //初始化事件
        this.initEvents();

    }
    //初始化渲染器
    initRenderer(){
        this.renderer.setClearColor(this.clearColor);
        this.renderer.setSize(this.viewW,this.viewH);
        this.renderer.shadowMap.enabled=true;
        this.viewDom.appendChild(this.domElement);
    }
    //初始化光
    initLight(){
        //环境光   环境光颜色RGB成分分别和物体材质颜色RGB成分分别相乘
        let ambient = new  AmbientLight(0x444444);
        this.scene.add(ambient);
        // 方向光
        let directionalLight = new  DirectionalLight(0xffffff, 1);
        // 设置光源位置
        directionalLight.position.set(parseUnit(3000),parseUnit(5000),parseUnit(2000));
        this.scene.add(directionalLight);
        // 设置用于计算阴影的光源对象
        directionalLight.castShadow = true;
        // 设置计算阴影的区域，最好刚好紧密包围在对象周围
        // 计算阴影的区域过大：模糊  过小：看不到或显示不完整
        directionalLight.shadow.camera.near = parseUnit(50);
        directionalLight.shadow.camera.far = parseUnit(10000);
        directionalLight.shadow.camera.left = parseUnit(-2000);
        directionalLight.shadow.camera.right = parseUnit(2000);
        directionalLight.shadow.camera.top = parseUnit(2000);
        directionalLight.shadow.camera.bottom =parseUnit(-2000);
        // 设置mapSize属性可以使阴影更清晰，不那么模糊
        directionalLight.shadow.mapSize.set(2048,2048);
    }
    //初始化事件
    initEvents(){
        const _this=this;
        //解决拖拽冲突
        this.transCtrl2.addEventListener( 'dragging-changed', function ( event ) {
            _this.orbitCtrl.enabled = ! event.value;
        } );
        //拖拽时，实时渲染
        this.transCtrl2.addEventListener( 'change', function ( event ) {
            _this.render();
        } );
        //轨道控制器旋转实时监听变化
        this.orbitCtrl.addEventListener( 'change', function(event){
            _this.transCtrl2.setScalar();
            if(!_this.transCtrl2.axis){
                //_this.transCtrl2.setDummyPosByObj();
            }
            _this.render();
        });
        //针对在平面图中旋转相机时出现的正交相机，将视图切换为透视状态
        //轨道控制器，拖拽结束后，根据相机方向变化判断旋转轨道
        this.orbitCtrl.addEventListener( 'end', function(event){
            _this.onOrbitDragEnd(event);
        });
        //鼠标抬起监听
        window.addEventListener('keydown',function (event) {
            _this.onWindowKeydown(event)

        });
        //窗口变换
        window.addEventListener( 'resize', function(event){
            _this.onWindowResize(event);
        } );
    }
    //建立辅助物体
    crtHelpObj(){
        let axesHelper = new AxesHelper(20);
        axesHelper.translateY(.001);
        this.scene.add(axesHelper);
    }
    test(){
        let _this=this;
        let boxMesh = new BoxMesh(.4,.2,.6);
        //this.scene.add(boxMesh);
        MatTool.parseMat('huTao',(matParam)=>{
            boxMesh.setMaterial(matParam);
            //_this.render();
        });
        //machine(可选对象，是否可吸附)
        //this.transCtrl2.machine(boxMesh,true);
        //手动选择
        //this.transCtrl2.attach(boxMesh);
    }
    getCamera(key){
        if(key==='p'){
            return this.cameraP();
        }else{
            return this.crtOrth(key);
        }
    }
    //建立相机
    cameraP(){
        let camera=new PerspectiveCamera(30,this.viewW/this.viewH,0.1,parseUnit(100000));
        camera.position.copy(this.camerasAttr['p'].cameraPos.clone());
        camera.lookAt(this.camerasAttr['p'].targetPos.clone());
        camera.updateMatrixWorld();
        this.scene.add( camera );
        return camera;

    }
    cameraF(){
        return this.crtOrth('f');
    }
    cameraT(){
        return this.crtOrth('t');
    }
    cameraL(){
        return this.crtOrth('l');
    }
    //建立正交相机
    crtOrth(key){
        let {viewW,viewH}=this;
        let camera = new OrthographicCamera( viewW / - 2, viewW / 2, viewH / 2, viewH / - 2, 0, parseUnit(100000));

        camera.position.copy(this.camerasAttr[key].cameraPos.clone());
        camera.zoom=500;
        camera.updateProjectionMatrix();
        this.scene.add( camera );
        return camera;
    }
    //获取相机方向
    getCamDir(){
        let dir=new Vector3();
        dir=this.camera.getWorldDirection(dir);
        return dir;
    }
    //渲染
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    //渲染，并更新虚拟框材质
    renderAndUpdateDummyMat(){

    }

    /*.......事件相关........*/
    //当窗口中键盘按下
    onOrbitDragEnd(event){
        //判断相机旋转
        let curCamDir=this.getCamDir();
        let cos=1-Math.abs(this.camDir.dot(curCamDir));
        if(this.view!=='p'&&cos>0.000001){
            this.transCtrl2.view='p';
            this.transCtrl2.setInitPlane();
        }
    }
    //窗口尺寸变化
    onWindowResize(event){
        this.viewW=this.viewDom.clientWidth;
        this.viewH=this.viewDom.clientHeight;
        this.camera.aspect = this.viewW/this.viewH;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize( this.viewW, this.viewH );
        this.render();
    }
    //当轨道控制器拖拽结束
    onWindowKeydown(event){
        let _this=this;
        event.stopPropagation();
        if(!event.shiftKey&&!event.ctrlKey&&!event.altKey&&!event.metaKey) {
            switch (event.keyCode) {
                case _this.keys.t:
                    this.changeView('t');
                    break;
                case _this.keys.p:
                    this.changeView('p');
                    break;
                case _this.keys.l:
                    this.changeView('l');
                    break;
                case _this.keys.f:
                    this.changeView('f');
                    break;
            }
        }
    }

    //切换视图
    changeView(v){
        if(v===this.view){return}
        //浮动物体置空，以应对切换视图后，一拖拽就进行浮动检测
        //this.transCtrl2.floatObj=null;
        //重置变换器信息
        this.view=v;
        this.camera=this.getCamera(this.view);
        this.orbitCtrl = new OrbitControls(this.camera,this.domElement);
        this.transCtrl2.view=v;
        this.transCtrl2.camera=this.camera;
        if(this.transCtrl2.crting){
            //如果是在创建中
            //设置拖拽轴有效性，和显示效果
            this.transCtrl2.setAxis(null);
            this.transCtrl2.setDragAxisByView();
            this.transCtrl2.setAxis(this.transCtrl2.axis);
        }
        //根据所选物体重置平面
        this.transCtrl2.setInitPlane();
        //根据视图，设置轨道控制器的平移模式
        if(v==='f'||v==='l'||v==='t'){
            this.orbitCtrl.screenSpacePanning=true;
        }else{
            this.orbitCtrl.screenSpacePanning=false;
        }
        //存储相机方向，用于正交平面转正交透视的判断
        this.camDir=this.getCamDir();
        //恒定缩放
        this.transCtrl2.setScalar();
        this.render();
        //回调方法
        this.onViewChange(v);
    }
    //根据视图和目标对象，设置相机位置
    setCameraPosByObj(){
        let obj=this.transCtrl2.object;
        if(!obj){return}
    }
    //建立家具
    crtFurn(furnName,param=null){
        let transCtrl2=this.transCtrl2;
        //正在创建家具
        transCtrl2.crting=true;
        //切换控制器
        transCtrl2.setMode('translate');

        //取消当前选择
        if(transCtrl2.object){
            transCtrl2.detach();
            this.render();
        }
        //建立地台
        //.6,.03,.322
        let diTai=new DiTai(param);
        diTai.visible=false;
        let _this=this;
        diTai.addEventListener('mat-parsed',function(){
            //解决线框深度被贴图遮挡的bug
            transCtrl2.updateDummyMat();
            _this.render();
        });
        this.scene.add(diTai);
        //应该把新建对象也合到此方法里
        transCtrl2.attach(diTai);
        transCtrl2.machine(diTai,false);
        //设置transCtrl 的拖拽轴
        transCtrl2.setDragAxisByView();
        //根据物体，设置鼠标与其它点位的位置关系
        transCtrl2.updateMouseAttrByObj();
        transCtrl2.setInitPlane();

        diTai.visible=false;
        transCtrl2.visible=false;
    }





}









