/*
* 分体厅柜-地台
* 形参{}
* w h d
* {
* */
import {BoxBufferGeometry, MeshLambertMaterial, Mesh, Group, TextureLoader} from 'three'
import BoxMesh  from '../Objects/BoxMesh'
import Mats from '@/com/Mats'
import Tool from '@/com/Tool'
import FurnData from '@/com/FurnData'
import Furn from '@/core/Furn'

const {parseUnit}=Tool;
const {livForm,sizeParam,matParam}=FurnData;
class DiTai extends Furn{
    constructor(param=null){
        super();
        this.data=null;
        this.width=600;
        this.height=30;
        this.depth=322;
        this.taiMat='huTao'; //铝框Mesh
        this.lvMat='lvMoSha'; //铝框Mesh
        this.name='DiTai';
        this.text='地台';
        this.ls=4;//铝框內缩
        this.lh=25;//铝框高度
        this.init(param);
    }
    //初始化属性、事件和模型
    init(param){
        //初始化data 数据
        this.initData();
        //监听数据
        this.walk();
        //初始化模型
        this.initMesh();
    }
    //初始化data 数据
    initData(){
        let _this=this;
        this.data=livForm(this,{
            width:sizeParam({
                label:'宽度',
                value:400,
                list:[400,600,900,1200,1350,1500,1650,1800],
                set:(val)=>{
                    _this.getObjectByName('lvK').setW(_this.getLw());
                    _this.getObjectByName('taiM').setW(parseUnit(val));
                }
            }),
            height:sizeParam({
                label:'高度',
                value:30,
                list:[30,50,100],
                set:(val)=>{
                    _this.getObjectByName('taiM').setH(parseUnit(val));
                }
            }),
            depth:sizeParam({
                label:'深度',
                value:322,
                list:[322,418,610],
                set:(val)=>{
                    _this.getObjectByName('lvK').setD(_this.getLd());
                    _this.getObjectByName('taiM').setD(parseUnit(val));
                }

            }),
            taiMat:matParam({
                value:'pingGuo',
                label:'台面材质',
                list:['huTao','pingGuo'],
                set:(val)=>{
                    let taiM=_this.getObjectByName('taiM');
                    taiM.setMaterial(Mats[val]);
                    _this.checkRender(taiM);
                }
            })
        })
    }
    //初始化模型
    initMesh(){
        let ls=parseUnit(this.ls);
        let lh=parseUnit(this.lh);
        let width=parseUnit(this.width);
        let depth=parseUnit(this.depth);
        let height=parseUnit(this.height);


        //铝框
        //先解析材质，将材质变成数组结构，贴图先变成颜色

        let meshLvK=new BoxMesh(this.getLw(),lh,this.getLd(),Mats[this.lvMat]);
        meshLvK.name='lvK';
        meshLvK.position.x=ls;
        meshLvK.position.z=ls;
        this.add(meshLvK);

        //台面
        let taiMat=Mats[this.taiMat];
        let textureLoader=new TextureLoader();
        let _this=this;
        /*let texture=textureLoader.load(taiMat.mapParam.imgSrc,function(){
            console.log('wwwwwwwwwwwww');
            taiMat.mapParam.imgSrc=texture;
            let meshTaiM=new BoxMesh(width,height,depth,taiMat);
            meshTaiM.name='taiM';
            meshTaiM.translateY(lh);
            _this.add(meshTaiM);
        });*/
        let meshTaiM=new BoxMesh(width,height,depth, Mats[this.taiMat]);
        meshTaiM.name='taiM';
        meshTaiM.translateY(lh);
        this.add(meshTaiM);
    }

    //添加渲染方法
    checkRender(obj){
        let _this=this;
        let timeSpace=16;
        let timeLength=0;
        let maxTime=5000;
        check();
        function check(){
            setTimeout(function(){
                timeLength+=timeSpace;
                if(timeLength>maxTime){
                    console.log('图片加载时间过长');
                    return;
                }
                if(obj.renderable){
                    obj.renderable=false;
                    setTimeout(function(){
                        _this.mapLoaded()
                    },100);
                }else{
                    check();
                }
            },timeSpace)
        }
    }
    //铝框宽
    getLw(){
        return parseUnit(this.width-this.ls*2);
    }
    //铝框身
    getLd(){
        return parseUnit(this.depth-this.ls*2);
    }

}

DiTai.text='地台';
export default DiTai;










