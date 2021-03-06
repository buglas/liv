 /*
* 分体厅柜-地台
* */
import {BoxBufferGeometry,RepeatWrapping,MeshLambertMaterial,Mesh,Texture,ImageLoader,TextureLoader,MeshPhongMaterial,Matrix4} from 'three'

/*
* matParam:
* matType: 材质类型
* map 贴图参数
* mapParam 贴图参数{
*   imgSrc:图片链接
*   size:默认null，不进行贴图重复设置，即充满面，可以使num，或者[numS,numT]
* }
* type 贴图的布局方式，默认自动布局
* */
export default class BoxMesh extends Mesh{
    constructor(w,h,d, matParam,type=null){
        //先不指定形参
        super();
        this.org='lbc';
        //现给予，再改变
        this.w=w;
        this.h=h;
        this.d=d;
        //若非数组转数组，无贴图除外
        this.matParam=null;
        //默认为null，会根据尺寸自动识别
        this.type=type;
        //是否自动变换类型
        this.autoType=type?false:true;
        this.rotateInds=null;
        this.material=[];
        this.matStorage={
            MeshLambertMaterial,
            MeshPhongMaterial
        };
        //默认接收和产生阴影
        this.castShadow=true;
        this.receiveShadow=true;
        //待加载的贴图数量
        this.mapNum=0;
        //贴图加载成功的次数
        this.mapLoadNum=0;
        //是否可以渲染
        this.renderable=false;
        //贴图是否在加载
        this.mapLoading=false;
        //虚拟材质
        this.dummyMat=null;
        //忽略的材质属性
        this.ignoreAttr=['matType','mapParam','text'];
        //初始化
        this.init(matParam);
    }
    init(matParam){
        //建立顶点模型
        this.geoUpdate();
        //判断一下状态，若为null 就自动判断
        this.setType();
        //需要旋转的索引
        this.rotateInds=this.getRotateInds();
        //设置材质
        this.setMaterial(matParam);

    }

    setW(w){
        this.w=w;
        this.updateBySize();
    }
    setH(h){
        this.h=h;
        this.updateBySize();
    }
    setD(d){
        this.d=d;
        this.updateBySize();
    }
    setSize(w,h,d){
        this.w=w;
        this.h=h;
        this.d=d;
        this.updateBySize();
    }
    //设置材质
    setMaterial(matParam){
        //重置贴图渲染数据
        this.updateRenderData();
        //材质设置
        this.matParam=this.setMatParam(matParam);
        //设置材质
        //先判断贴图参数,是否为数组.注意带有贴图的单个mat 已经被加工成数组了
        if(this.matParam.constructor===Array){
            //材质形参是数组
            //计算贴图数量
            this.setMapNum();
            //暂存材质
            this.dummyMat=this.getMatByMult();
        }else if(this.matParam.mapParam){
            //一个贴图
            this.mapNum=1;
            this.dummyMat=this.newMat(this.matParam);
        }else{
            //无贴图，单色材质
            this.mapNum=0;
            this.dummyMat=this.newMat(this.matParam);
        }

        if(this.mapNum===0){
            //无贴图时，直接生成材质
            this.material=this.dummyMat;
        }
    }
    getMaterial(matParam){

    }
    //设置材质参数，单个变数组，单个且单色不考虑
    setMatParam(matParam){
        if(matParam.imgSrc){
            let arry=[];
            for(let i=0;i<6;i++){
                let matParamNew={}
                //深拷贝，以方便加工
                for(let key in matParam){
                    matParamNew[key]=matParam[key];
                }
                arry[i]=matParamNew;
            }
            return arry;
        }else{
            return matParam;
        }
    }
    updateBySize(){
        //建立模型，并更新
        this.geoUpdate();
        //更新状态
        this.setType();
        //需要旋转的索引
        this.rotateInds=this.getRotateInds();
        //设置材质旋转和重复
        this.setTextureRotateAndRepeate();
    }
    //设置贴图旋转和重复
    setTextureRotateAndRepeate(material=this.material){
        //贴图的纵横
        //排除单独材质，因为单独材质必然是单色
        if(material.constructor===Array){
            for(let i=0;i<material.length;i++){
                let texture=material[i].map;
                if(texture){
                    this.setMap(texture,i);
                }
            }
        }
    }
    //建立顶点模型
    geoUpdate(){
        const {w,h,d}=this;
        this.geometry=new BoxBufferGeometry(w,h,d);
        //模型基点定位
        if(this.org==='lbc'){
            let m = new Matrix4();
            m.makeTranslation(w/2,h/2,d/2);
            m.applyToBufferAttribute(this.geometry.attributes.position);
        }
        //模型基点定位
        /*if(this.org==='lbc'){
            let array=this.geometry.attributes.position.array;
            array.forEach(function(ele,ind){
                if(ind%3===0){
                    array[ind]+=w/2;
                    array[ind+1]+=h/2;
                    array[ind+2]+=d/2;
                }
            });
        }*/
    }
    //设置贴图的纵横类型
    setType(){
        if(this.autoType){
            this.type=this.getType();
        }
    }

    //状态判断
    getType(){
        let w={len:this.w,ind:null};
        let h={len:this.h,ind:null};
        let d={len:this.d,ind:null};
        let arr=[w,h,d];
        let a=arr[0];
        if(a.len>h.len){
            a=h;
        }
        if(a.len>d.len){
            a=d;
        }
        a.ind='1';
        arr.splice(arr.indexOf(a), 1);
        if(arr[0].len>arr[1].len){
            arr[0].ind='3';
            arr[1].ind='2';
        }else{
            arr[0].ind='2';
            arr[1].ind='3';
        }
        return `${w.ind}${h.ind}${d.ind}`;
    }
    //获取rotateInds
    getRotateInds(){
        switch (this.type) {
            case '123':
                return [2,3,4,5];
                break;
            case '132':
                return [0,1,2,3,4,5];
                break;
            case '213':
                return [2,3];
                break;
            case '231':
                return [0,1,4,5];
                break;
            case '321':
                return [0,1];
                break;
            case '312':
                return [];
                break;
        }
    }
    //设置贴图数量
    setMapNum(){
        let matParam=this.matParam;
        for(let i=0;i<6;i++){
            if(matParam[i]&&matParam[i].mapParam){
                this.mapNum++;
            }
        }
    }
    //根据数组获取材质
    getMatByMult(){
        let matParam=this.matParam;
        let mats=[];
        for(let i=0;i<6;i++){
            let mat=null;
            if(matParam[i]&&matParam[i].mapParam){
                mat=this.crtMat(i);
            }else{
                //这个貌似没有用了，先留着
                mat=this.newMat(matParam[i]||{});
            }
            mats[i]=mat;
        }
        return mats;
    }
    //循环遍历，赋予每个面纹理
    crtMat(i){
        let matParam=this.matParam[i];
        //设置纹理
        matParam.mapParam=this.getMapParam(i);
        let mat=this.newMat(matParam);
        return mat;
    }
    //设置纹理
    getMapParam(i){
        let mapParam=this.matParam[i].mapParam;
        Object.assign(mapParam,this.getRotateAndRepeat(i,mapParam.size));
        return mapParam;
    }

    //设置纹理
    setMap(texture,i){
        let mapParam=this.matParam[i].mapParam;
        let size=mapParam.size;
        let obj=this.getRotateAndRepeat(i,size);
        let {repeatS,repeatT,rotation}=obj;
        if(repeatS&&repeatT){
            texture.repeat.set(repeatS,repeatT);
        }
        if(rotation){
            texture.rotation=rotation;
        }
        Object.assign(mapParam,obj);
    }
    getRotateAndRepeat(i,size){
        let obj={};
        let inc=this.rotateInds.includes(i);
        if(size){
            //获取重复系数
            let rep=this.getRepeat(i,size,inc);
            //若贴图转了，重复参数也要翻转一下
            if(inc){
                rep.reverse();
            }
            [obj.repeatS,obj.repeatT]=[...rep];
        }
        //旋转
        if(inc){
            //判断状态，i，判断是否要转一圈
            obj.rotation=Math.PI/2;
        }
        return obj;
    }
    getRepeat(i,size,inc){
        let {width,height,depth}=this.geometry.parameters;
        let sizeS,sizeT;
        if(typeof size==='number'){
            sizeS=sizeT=size;
        }else{
            //不同的的面的重复参数，在不同的状态下，会像纵横一样发生反转
            if(inc){
                [sizeT,sizeS]=size;
            }else{
                [sizeS,sizeT]=size;
            }
        }
        let [wp,hp,dp]=[width/size,height/size,depth/size];
        switch (i) {
            case 0:
            case 1:
                return [depth/sizeS,height/sizeT];
                break;
            case 2:
            case 3:
                return [width/sizeS,depth/sizeT];
                break;
            case 4:
            case 5:
                return [width/sizeS,height/sizeT];
                break;
        }
    }
    //新建材质的方法
    newMat(matParam){
        //获取有用的材质参数，比如color
        let param={color:0xffffff};
        for(let key in matParam){
            if(!this.ignoreAttr.includes(key)){
                param[key]=matParam[key];
            }
        }
        //建立贴图
        let mapParam=matParam.mapParam;
        let _this=this;
        //获取材质的构造函数
        let matType=matParam.matType||'MeshLambertMaterial';

        if(mapParam){
            let {imgSrc,rotation,repeatS,repeatT,wrapS=RepeatWrapping,wrapT=RepeatWrapping}=mapParam;
            let textureLoader = new TextureLoader();
            let texture = textureLoader.load(imgSrc,function(){
                _this.checkRenderable();
            });
            //let texture=imgSrc;

            if(repeatS&&repeatT){
                texture.wrapS=wrapS;
                texture.wrapT=wrapT;
                texture.repeat.set(repeatS,repeatT);
            }
            if(rotation){
                texture.rotation=rotation;
            }
            param.map=texture;
        }
        //返回new 材质对象
        return new this.matStorage[matType](param);
    }
    //检测是否可渲染
    checkRenderable(){
        this.mapLoadNum++;
        if(this.mapLoadNum===this.mapNum){
            this.material=this.dummyMat;
            this.renderable=true;
            this.mapLoading=false;
        }else{
            this.mapLoading=true;
        }
    }
    //重置数据
    updateRenderData(){
        this.mapNum=0;
        this.mapLoadNum=0;
    }
}
