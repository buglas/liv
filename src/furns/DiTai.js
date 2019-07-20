/*
* 分体厅柜-地台
* 形参{}
* w h d
* {
* */
import {BoxBufferGeometry,MeshLambertMaterial,Mesh,Group} from 'three'
import BoxMesh  from '../Objects/BoxMesh'
import Mats from '@/com/Mats'
import Tool from '@/com/Tool'
const {parseUnit}=Tool;
export default class DiTai extends Group{
    constructor(param=null){
        super();
        this.width=parseUnit(600);
        this.height=parseUnit(30);
        this.depth=parseUnit(322);
        this.taiMat=Mats.huTao; //铝框Mesh
        this.lvMat=Mats.lvMoSha; //铝框Mesh

        this.ls=parseUnit(4);//铝框內缩
        this.lh=parseUnit(25);//铝框高度
        this.events=null;
        this.init(param);
    }
    //初始化属性、事件和模型
    init(param){
        console.log('param',param);
        //初始化属性
        this.setAttr(param);
        //初始化模型
        this.initMesh();
        //初始化事件
        this.initEvents();

    }

    //为对象赋值属性
    setAttr(param){
        for(let key in param){
            this[key]=param[key];
        }
    }
    //初始化模型
    initMesh(){
        let {width,depth,ls}=this;
        //铝框
        let meshLvK=new BoxMesh(this.getLw(),this.lh,this.getLd(),this.lvMat);
        meshLvK.name='lvK';
        meshLvK.position.x=ls;
        meshLvK.position.z=ls;
        this.add(meshLvK);
        //台面
        let meshTaiM=new BoxMesh(width,this.getTh(),depth, this.taiMat);
        meshTaiM.name='taiM';
        meshTaiM.translateY(this.lh);
        this.add(meshTaiM);
    }
    //初始化事件
    initEvents(){
        let _this=this;
        this.addEventListener('width',(event)=>{
            _this.width=event.value;
            _this.getObjectByName('lvK').setW(_this.getLw());
            _this.getObjectByName('taiM').setW(_this.width);
        });
        this.addEventListener('height',(event)=>{
            _this.height=event.value;
            _this.getObjectByName('taiM').setH(_this.getTh());
        });
        this.addEventListener('depth',(event)=>{
            _this.depth=event.value;
            _this.getObjectByName('lvK').setD(this.getLd());
            _this.getObjectByName('taiM').setD(_this.depth);
        })

    }

    //铝框宽
    getLw(){
        return this.width-this.ls*2;
    }
    //铝框身
    getLd(){
        return this.depth-this.ls*2;
    }
    //台面高
    getTh(){
        return this.height-this.lh;
    }
}














