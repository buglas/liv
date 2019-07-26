import Observer from '@/front/Observer'
import Tool from '@/com/Tool'
import Conf from '../com/Conf'
import {LogLuvEncoding} from "three";
let unit=Conf.unit;
export default class Mvvm{
    constructor({webglPart}){
        //data 可以是当前选择的家具
        this.webglPart=webglPart;
        //用于将来更新表单
        //{dom:节点,value:值,key:属性}
        this.subs=[];

    }
    //重置代理
    resetProxy(inps,keyName='name'){
        this.subs={};
        let _this=this;
        Array.prototype.forEach.call(inps,(ele)=>{
            _this.addProxy(ele.getAttribute(keyName),ele);
        });
    }
    //添加代理
    addProxy(key,ele){
        this.subs[key]=ele;
        //设置mvvm对象的代理键
        this.proxyKey(key);
    }
    //设置mvvm对象的代理键
    proxyKey(key){
        let self = this;
        let furn=self.webglPart.transCtrl2.object;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function () {
                furn.dispatchEvent({
                    type: key,
                    name:'get',
                });
                //根据key 类型判断属性的获取方式：直接属性，变换属性
                return furn[key];
            },
            set: function (newVal) {
                furn.dispatchEvent({
                    type: key,
                    value:newVal,
                    name:'set',
                });
            },
        });
    }
    notify(){
        let _this=this;
        this.subs.forEach((ele)=>{
            if(ele.value!==_this[ele.key]){
                //更新input 的值
                ele.dom.value=_this[ele.key];
            }
        })
    }

}