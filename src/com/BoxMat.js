import {Texture, TextureLoader} from "three";

export default class BoxMat{
    constructor(matParam,success=()=>{},error=()=>{}){
        this.matParam=matParam;
        //promise 集合
        this.imgPros=[];
        //成败
        this.success=success;
        this.error=error;
        //初始化
        this.init();
    }
    init(){
        //单个贴图变数组
        this.parseMatParam();
        //贴图集合
        this.setImgPros();
        //加载图片
        this.walk();
    }
    //单个贴图变数组
    parseMatParam(){
        let matParam=this.matParam;
        if(matParam.mapParam){
            let arry=[];
            for(let i=0;i<6;i++){
                let texture=new Texture();
                arry[i]={
                    text:matParam.text,
                    matType:matParam.matType,
                    mapParam:{
                        size:matParam.mapParam.size,
                        imgSrc:matParam.mapParam.imgSrc,
                    }
                };
            }
            this.matParam= arry;
        }
    }
    walk(){
        let _this=this;
        if(this.imgPros.length){
            Promise.all(this.imgPros).then(()=>{
                _this.success(_this.matParam);
            },()=>{
                _this.error('图片加载失败');
            })
        }else{
            _this.success(_this.matParam);
        }

    }

    //贴图集合
    setImgPros(){
        let _this=this;
        if(this.matParam.constructor===Array){
            this.matParam.forEach((param)=>{
                _this.addPro(param);
            })
        }else{
            _this.addPro(this.matParam);
        }
    }
    //添加贴图
    addPro(matParam){
        if(matParam.mapParam){
            //建立promise
            let pro=this.imgLoad(matParam.mapParam);
            this.imgPros.push(pro);

        }
    }

    imgLoad(mapParam){
        const textureLoader = new TextureLoader();
        const promise=new Promise((resolve, reject) => {
            let texture = textureLoader.load(mapParam.imgSrc,function(){
                mapParam.map=texture;
                resolve();
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
