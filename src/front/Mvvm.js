import Observer from '@/front/Observer'
import Tool from '@/com/Tool'
import Conf from '../com/Conf'
let unit=Conf.unit;
export default class Mvvm{
    constructor({webglPart}){
        //data 可以是当前选择的家具
        this.webglPart=webglPart;
        //建立一个方向属性
        //用于判断是表单改变了视图
        //...
        //{dom:节点,value:值,key:属性}
        this.subs=[];

    }
    //用不上
    proxy(){
        let self=this;
        this.subs.forEach(function (ele) {
            self.proxyKey(ele.key);
        });
    }
    //设置mvvm对象的代理键
    proxyKey(key){
        let self = this;
        let furn=self.webglPart.transCtrl2.object;
        Object.defineProperty(this, key, {
            enumerable: false,
            configurable: true,
            get: function () {
                //根据key 类型判断属性的获取方式：直接属性，变换属性
                return furn[key];
            },
            set: function (newVal) {
                furn.dispatchEvent({
                    type: key,
                    value:newVal
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