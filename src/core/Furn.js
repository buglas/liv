/*
* 家具核心类
* */
import {BoxBufferGeometry,MeshLambertMaterial,Mesh,Group} from 'three'
import Conf from '../com/Conf'
import BoxMesh  from '../Objects/BoxMesh'
import FurnData from "@/com/FurnData";

export default class DiTai extends Group{
    constructor(){
        super();
        this.data=null;
        this.width=600;
        this.height=30;
        this.depth=322;

        this.text='家具名称';
    }
    //初始化属性、事件和模型
    init(){
        //初始化data 数据
        this.initData();
        //监听数据
        this.walk();
        //初始化模型
        this.initMesh();
    }
    //监听数据
    walk(){
        let _this=this;
        for(let key in this.data){
            Object.defineProperty(this, key, {
                get: function () {
                    if(_this.data[key].get){
                        //如果数据里存在get 方法，就是用数据里的get 方法
                        return _this.data[key].get();
                    }else{
                        //否则就将数据里的值返回
                        return _this.data[key].value;
                    }

                },
                set: function (val) {
                    if(_this.data[key].valType==='number'){
                        val=Math.round(val);
                    }
                    _this.data[key].value=val;
                    //调用数据里的set 方法
                    _this.data[key].set(val);
                },
            })
        }
    }
    //材质解析完成事件
    matParsed(){
        this.dispatchEvent({type:'mat-parsed'});
    }

    //相对位移。绝对位置直接为xyz 赋值即可，以做set 监听
    moveX(val){
        this.translateX(val/1000);
    }
    moveY(val){
        this.translateY(val/1000);
    }
    moveZ(val){
        this.translateZ(val/1000);
    }
    move(x,y,z){
        this.translateX(x/1000);
        this.translateY(y/1000);
        this.translateZ(z/1000);
    }

    //为实际模型设置位置的绝对位
    setPos(axis,val){
        this.position[axis]=Math.round(val)/1000;
    }
    //获取模型位置，给予表单
    getPos(axis){
        return Math.round(this.position[axis]*1000);
    }

    /*-------一个尺寸的改变，影响其它尺寸的取值区间--------*/
    //遍历三个尺寸，设置其状态
    initSizeState(){
        const arry=['width','height','depth'];
        for(let key of arry){
            if(this.section[key]){
                this.setSizeState(key,this.data[key].value);
            }
        }
    }
    //根据尺寸值，设置尺寸状态数据sizeState
    setSizeState(key,val){
        this.sizeState[key]=this.getSectPos(this.section[key],val);
    }
    //获取尺寸所处的区间位置
    getSectPos(ps,val){
        let n=0;
        let len=ps.length;
        for (let i=0;i<len;i++){
            if(i===0&&val<ps[i]){
                break;
            }else if(i===len-1){
                n=len;
                break;
            }else if(val>=ps[i]&&val<ps[i+1]){
                n=i+1;
                break;
            }
        }
        return n;
    }

    /*-------对家具数据的某些属性进行单点设置--------*/
    //设置list
    setList(key,list){
        this.data[key].list=FurnData.parseList(list);
    }
    setMax(key,val){
        this.data[key].max=val;
    }
    setMin(key,val){
        this.data[key].min=val;
    }



}
