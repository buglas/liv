/*
* 分体厅柜-地台
* */
import {BoxBufferGeometry,RepeatWrapping,MeshLambertMaterial,Mesh,Texture,ImageLoader,TextureLoader,MeshPhongMaterial} from 'three'
import Conf from '../com/Conf'
/*
* matParam:
* 正常的Material 参数
* img:Image 对象
* matType: 材质类型
* imgSize:默认null，不进行贴图重复设置
* */
export default class BoxMesh extends Mesh{
    constructor(w,h,d, matParam,type=null){
        //先不指定形参
        super();
        //现给予，再改变
        this.w=w;
        this.h=h;
        this.d=d;
        //若非数组转数组，无贴图除外
        this.matParam=this.setMatParam(matParam);
        this.type=type;
        //是否自动变换类型
        this.autoType=type?false:true;
        this.rotateInds=null;
        this.material=[];
        this.matStorage={
            MeshLambertMaterial,
            MeshPhongMaterial
        };
        this.init();
    }
    init(){
        this.geoUpdate();
        //判断一下状态，若为null 就自动判断
        this.setType();
        //需要旋转的索引
        this.rotateInds=this.getRotateInds();
        //先判断贴图参数是否为数组
        if(this.matParam.constructor===Array){
            this.material=this.getMatByMult();
        }else{
            this.material=this.newMat(this.matParam);
        }
        //默认接收和产生阴影
        this.castShadow=true;
        this.receiveShadow=true;
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
    setMaterial(matParam){

        this.matParam=this.setMatParam(matParam);
        console.log(matParam);
        //设置材质
        //先判断贴图参数是否为数组
        if(this.matParam.constructor===Array){
            this.material=this.getMatByMult();
        }else{
            this.material=this.newMat(this.matParam);
        }
    }
    //设置材质参数，单个变数组，单个且单色不考虑
    setMatParam(matParam){
        if(matParam.img){
            let arry=[];
            for(let i=0;i<6;i++){
                arry[i]=matParam;
            }
            return arry;
        }else{
            return matParam;
        }
    }
    updateBySize(){
        //更新模型
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
                    this.setTexture(texture,i);
                }
            }
        }
    }

    geoUpdate(){
        this.geometry=new BoxBufferGeometry(this.w,this.h,this.d);
    }
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
    //根据数组获取材质
    getMatByMult(){
        let matParam=this.matParam;
        let mats=[];
        for(let i=0;i<6;i++){
            let mat=null;
            if(matParam[i]&&matParam[i].img){
                mat=this.crtMat(i);
            }else{
                mat=this.newMat(matParam[i]||{});
            }
            mats[i]=mat;
        }
        return mats;
    }
    //循环遍历，赋予每个面纹理
    crtMat(i){
        let matParam=this.matParam[i];
        let img=matParam.img;
        let imgSize=matParam.imgSize;
        let textureLoader = new TextureLoader();
        let texture = textureLoader.load(img);
        texture.wrapS = RepeatWrapping;
        texture.wrapT = RepeatWrapping;
        //设置纹理
        this.setTexture(texture,i);
        //需定制
        matParam.map=texture;
        let mat=this.newMat(matParam);
        return mat;
    }
    //设置纹理
    setTexture(texture,i){
        let imgSize=this.matParam[i].imgSize;
        let inc=this.rotateInds.includes(i);
        //重复
        if(imgSize){
            //获取重复系数
            let rep=this.getRepeat(i,imgSize);
            //若贴图转了，重复参数也要翻转一下
            if(inc){
                rep.reverse();
            }
            texture.repeat.set(...rep);
        }
        //旋转
        if(inc){
            //判断状态，i，判断是否要转一圈
            texture.rotation=Math.PI/2;
        }
    }
    getRepeat(i,imgSize){
        let {width,height,depth}=this.geometry.parameters;
        let [wp,hp,dp]=[width/imgSize,height/imgSize,depth/imgSize];
        switch (i) {
            case 0:
            case 1:
                return [dp,hp];
                break;
            case 2:
            case 3:
                return [wp,dp];
                break;
            case 4:
            case 5:
                return [wp,hp];
                break;
        }
    }
    //新建材质的方法
    newMat(matParam){
        //获取有用的材质参数
        let param={};
        let rem=['img','imgSize','matType','repeat'];
        for(let key in matParam){
            if(!rem.includes(key)){
                param[key]=matParam[key];
            }
        }
        //获取材质的构造函数
        let matType=matParam.matType||'MeshLambertMaterial';
        //返回new 材质对象
        return new this.matStorage[matType](param);
    }


}