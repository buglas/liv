import Conf from '../com/Conf'
export default class Mvvm{
    constructor(){
        //用于将来更新表单
        this.subs=[];
    }
    //重置绑定关系
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
    //遍历subs，获取object 的相关属性，更新到表单
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
