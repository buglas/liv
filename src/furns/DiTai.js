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
        this.taiMat='huTao'; //铝框Mesh
        this.lvMat='lvMoSha'; //铝框Mesh

        this.ls=parseUnit(4);//铝框內缩
        this.lh=parseUnit(25);//铝框高度
        this.init(param);
    }
    //初始化属性、事件和模型
    init(param,render){
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
        let meshLvK=new BoxMesh(this.getLw(),this.lh,this.getLd(),Mats[this.lvMat]);
        meshLvK.name='lvK';
        meshLvK.position.x=ls;
        meshLvK.position.z=ls;
        this.add(meshLvK);
        //台面
        let meshTaiM=new BoxMesh(width,this.height,depth, Mats[this.taiMat]);
        meshTaiM.name='taiM';
        meshTaiM.translateY(this.lh);
        this.add(meshTaiM);
    }
    //初始化事件
    initEvents(){
        let _this=this;
        let taiM=this.getObjectByName('taiM');
        let lvK=this.getObjectByName('lvK');
        this.addEventListener('width',(event)=>{
            _this.width=event.value;
            lvK.setW(_this.getLw());
            taiM.setW(_this.width);
        });
        this.addEventListener('height',(event)=>{
            _this.height=event.value;
            taiM.setH(_this.height);
        });
        this.addEventListener('depth',(event)=>{
            _this.depth=event.value;
            lvK.setD(this.getLd());
            taiM.setD(_this.depth);
        });
        this.addEventListener('taiMat',(event)=>{
            _this.taiMat=event.value;
            taiM.setMaterial(Mats[event.value]);
            _this.checkRender(taiM);
        });
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
                    console.log('可以渲染: ',timeLength);
                    _this.mapLoaded();
                }else{
                    check();
                }
            },timeSpace)
        }
    }
    //铝框宽
    getLw(){
        return this.width-this.ls*2;
    }
    //铝框身
    getLd(){
        return this.depth-this.ls*2;
    }
    //渲染时间
    mapLoaded(){
        this.dispatchEvent({type:'map-loaded'});
    }

}














