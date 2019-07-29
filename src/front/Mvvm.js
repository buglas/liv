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
    updateSubs(inps,object,keyName='name'){
        this.subs={};
        let _this=this;
        Array.prototype.forEach.call(inps,(ele)=>{
            let key=ele.getAttribute(keyName);
            _this.subs[key]={
                dom:ele,
                mold:ele.getAttribute('data-mold'),
                dataValue:ele.getAttribute('data-value'),
                dataText:ele.getAttribute('data-text'),
                list:object.data[key].list,
            };
        });
    }

    notify(object){
        for(let key in this.subs){
            let {dom,mold,dataValue,dataText,list}=this.subs[key];
            let curValue=object[key].toString();
            if(dataValue!==curValue){
                this.subs[key].dataValue=curValue;
                dom.setAttribute('data-value',curValue);
                if(mold==='input'){
                    dom.value=curValue;
                }else{
                    dom.value=list[curValue].text;
                }

            }
        }
    }


}