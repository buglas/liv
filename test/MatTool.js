import {
    TextureLoader,
    MeshLambertMaterial,
    MeshPhongMaterial,

} from "three";

export default class MatTool{
    constructor(matParam){
        this.matStorage={
            MeshLambertMaterial,
            MeshPhongMaterial,
        };
        //贴图集合
        this.imgs=[];
        //设置材质参数，单个贴图变数组，单个且单色不考虑
        this.matParam=null;
        //初始材质
        this.initMat=null;
        //

        this.init(matParam);
    }
    init(){
        //贴图集合
        this.setImgs(matParam);
        //设置材质参数
        this.matParam=this.parseMatParam(matParam);
        //遍历材质，设置初始材质
        this.setInitMap();
    }
    //设置材质参数，单个贴图变数组，单个且单色不考虑
    parseMatParam(matParam){
        if(matParam.mapParam){
            let arry=[];
            for(let i=0;i<6;i++){
                //matParam 拷贝6份
                let matParamNew={};
                //深拷贝材质数据，以方便单面加工
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
    //贴图集合
    setImgs(matParam){
        let _this=this;
        if(this.matParam.constructor===Array){
            this.matParam.forEach((param)=>{
                _this.addImg(param);
            })
        }else{
            _this.addImg(param);
        }
    }
    //添加贴图
    addImg(matParam){
        if(matParam.mapParam){
            let imgSrc=matParam.mapParam.imgSrc;
            if(!this.imgs.includes(imgSrc)){
                this.imgs.push(imgSrc);
            }

        }
    }
    //遍历材质，设置初始材质
    setInitMap(){
        let matParam=this.matParam;
        if(this.matParam.constructor===Array){
            this.matParam.forEach((param,ind)=>{
                if(param.imgSrc){
                    param.color=0xeeeeee;
                }
            })
        }
    }

    imgLoad(param){
        const textureLoader = new TextureLoader();
        const promise=new Promise((resolve, reject) => {
            let texture = textureLoader.load(param.mapParam.imgsrc,function(){
                param.texture=texture;
                resolve({res:1,msg:'img loaded'});
            },null,reject);
        });
        return promise;
    }


}

/*const MatTool={
    //尚未适用
    imgLoad:(imgsrc)=>{
        const textureLoader = new TextureLoader();
        const promise=new Promise((resolve, reject) => {
            let texture = textureLoader.load(imgsrc,function(){
                resolve(texture);
            },null,reject);
        });
        return promise;
    },
    //遍历查找贴图，记录贴图贴图索引，建立texture 的异步promise
    //解析原始材质数据
    parseMatParam(matParam){

    }


};
export default MatTool;*/
