import {MeshLambertMaterial, MeshPhongMaterial, Texture, TextureLoader,ImageLoader} from "three";
import Conf from '@/com/Conf'
import Mats from '@/com/Mats'
const unit=Conf.unit;

const MatTool={
    error(){
        console.error('图片加载失败');
    },
    parseMat(matParam,success=()=>{},error=MatTool.error){

        matParam=MatTool.getParam(matParam);

        let props=MatTool.getImgProps(matParam);
        if(props.length){
            Promise.all(props).then(()=>{
                success(matParam);
            },()=>{
                error('图片加载失败');
            })
        }else{
            success(matParam);
        }
    },
    //单个贴图变数组
    getParam(matParam){
        matParam=MatTool.parseMatByStr(matParam);
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
            return arry;
        }else{
            return matParam;
        }
    },
    parseMatByStr(matParam){
        if(typeof matParam==='string'){
            matParam=Mats[matParam];
            if(!matParam){
                console.error('Mats 材质库数据库中没有此材质名称');
            }
        }
        return matParam;
    },
    getImgProps(matParam){
        let props=[];
        if(matParam.constructor===Array){
            matParam.forEach((param)=>{
                MatTool.addPro(props,param);
            })
        }else{
            MatTool.addPro(props,matParam);
        }
        return props;
    },
    addPro(props,matParam){
        if(matParam.mapParam){
            //建立promise
            let pro=this.imgLoad(matParam.mapParam);
            props.push(pro);
        }
    },
    imgLoad(mapParam){
        const imageLoader = new ImageLoader();
        const promise=new Promise((resolve, reject) => {
            imageLoader.load(mapParam.imgSrc,function(img){
                mapParam.img=img;
                resolve();
            },null,reject);
        });
        return promise;
    }



};
export default MatTool;
