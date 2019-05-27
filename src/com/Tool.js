import {MeshLambertMaterial, MeshPhongMaterial} from "three";
import {RepeatWrapping, TextureLoader} from "three/src/Three";

const Tool={
    matStorage:{
        MeshLambertMaterial,
        MeshPhongMaterial,
    },
    newMat:function(matParam){
        //建立贴图数据，排除不必要的
        let param={};
        let matRemove=['matType','mapParam'];
        for(let key in matParam){
            if(!matRemove.includes(key)){
                param[key]=matParam[key];
            }
        }
        //建立贴图
        let mapParam=matParam.mapParam;
        if(mapParam&&mapParam.imgSrc){
            let {imgSrc,wrapS=RepeatWrapping,wrapT=RepeatWrapping,repeatS,repeatT}=mapParam;
            let textureLoader = new TextureLoader();
            let texture = textureLoader.load(imgSrc);
            texture.wrapS = wrapS;
            texture.wrapT = wrapT;
            if(repeatS&&repeatT){
                texture.repeat.set(repeatS,repeatT);
            }
            param.map=texture;
        }
        //获取材质的构造函数
        let matType=matParam.matType||'MeshLambertMaterial';
        //返回new 材质对象
        return new this.matStorage[matType](param);
    }
};
export default Tool;