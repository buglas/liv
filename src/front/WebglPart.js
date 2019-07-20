import {
    Scene,PerspectiveCamera,WebGLRenderer,Color,AxesHelper,BoxBufferGeometry,MeshLambertMaterial,Mesh,AmbientLight,DirectionalLight,Vector3,OrthographicCamera
} from 'three';
import OrbitControls from 'three-orbitcontrols'
import DiTai from '@/furns/DiTai'
import TransformControls2 from '@/lib/TransformControls2'
import Mats from '@/com/Mats'
import Tool from "@/com/Tool";
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
        //相机集合
        this.cameras=null;
        //变换控制器
        this.transCtrl2=null;
        //轨道控制器
        this.orbitCtrl = null;
        //相机默认位置
        this.camerasPos={
          p:new Vector3(parseUnit(1000),parseUnit(1200),parseUnit(2000)),
          f:new Vector3(parseUnit(0),parseUnit(0),parseUnit(5000)),
          t:new Vector3(parseUnit(0),parseUnit(5000),parseUnit(0)),
          l:new Vector3(parseUnit(5000),parseUnit(0),parseUnit(0)),
        };

        //事件
        this.events={
            //开始建立家具
            //'crt':()=>{},
            //家具的完成建立
            'crted':()=>{},
        }
        //this.init();
    }
    init(){
        //容器尺寸
        this.viewW=this.viewDom.clientWidth;
        this.viewH=this.viewDom.clientHeight;
        //初始化渲染器
        this.initRenderer();
        //场景
        this.scene=new Scene();
        //相机集合
        this.cameras={
            p:this.getCamera('p'),
            f:this.getCamera('f'),
            t:this.getCamera('t'),
            l:this.getCamera('l'),
        };
        //变换控制器
        this.transCtrl2=new TransformControls2(this.cameras[this.view],this.domElement);
        this.scene.add(this.transCtrl2);
        //轨道控制器
        this.orbitCtrl = new OrbitControls(this.cameras[this.view],this.domElement);
        //建立辅助物体
        this.crtHelpObj();
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
        this.orbitCtrl.addEventListener( 'change', function(){
            _this.transCtrl2.setScalar();
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

    getCamera(key){
        if(key==='p'){
            return this.cameraP();
        }else{
            return this.crtOrth(key);
        }
    }
    //建立相机
    cameraP(){
        let camera=new PerspectiveCamera(45,this.viewW/this.viewH,0.1,parseUnit(100000));
        camera.position.copy(this.camerasPos['p'].clone());
        camera.lookAt(this.scene.position);
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
        camera.zoom=500;
        camera.position.copy(this.camerasPos[key].clone());
        camera.updateProjectionMatrix();
        this.scene.add( camera );
        return camera;
    }
    //获取相机方向
    getCamDir(){
        let dir=new Vector3();
        dir=this.cameras[this.view].getWorldDirection(dir);
        return dir;
    }
    //渲染
    render() {
        this.renderer.render(this.scene, this.cameras[this.view]);
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
        this.cameras[this.view].aspect = this.viewW/this.viewH;
        this.cameras[this.view].updateProjectionMatrix();
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
        //if(v===this.view){return}
        //重置变换器信息
        this.view=v;
        this.cameras[this.view]=this.getCamera(this.view);
        this.orbitCtrl = new OrbitControls(this.cameras[this.view],this.domElement);
        this.transCtrl2.view=v;
        this.transCtrl2.camera=this.cameras[this.view];
        this.transCtrl2.setScalar();
        this.transCtrl2.setInitPlane();
        if(v==='f'||v==='l'){
            this.orbitCtrl.screenSpacePanning=true;
        }else{
            this.orbitCtrl.screenSpacePanning=false;
        }
        //存储相机方向，用于正交平面转正交透视的判断
        this.camDir=this.getCamDir();

        if(v==='p'){
            console.log('1-objInitPos',this.transCtrl2.objInitPos);
            //this.transCtrl2.setInitPlaneInPforY();
            //console.log('2-objInitPos',this.transCtrl2.objInitPos);
        }

        this.render();
    }

    //建立家具
    crtFurn(furnName,param=null){
        let transCtrl2=this.transCtrl2;
        //正在创建家具
        transCtrl2.crting=true;
        //取消当前选择
        if(transCtrl2.object){
            transCtrl2.detach();
            this.render();
        }
        //建立地台
        //.6,.03,.322
        let [w,h,d]=[.6,.03,.322];
        //let diTai=new DiTai(w,h,d,Mats.huTao,Mats.lvMoSha);
        let diTai=new DiTai(param);
        diTai.visible=false;
        this.scene.add(diTai);
        //应该把新建对象也合到此方法里
        transCtrl2.attach(diTai);
        transCtrl2.machine(diTai,false);
        //设置transCtrl 的拖拽轴
        transCtrl2.setDragAxisByView();
        //根据物体，设置鼠标与其它点位的位置关系
        transCtrl2.updateMouseAttrByObj();
        if(transCtrl2.view==='p'){
            diTai.visible=false;
            transCtrl2.visible=false;
        }
    }

}









