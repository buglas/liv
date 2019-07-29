import WebglPart from '@/front/WebglPart'
import Mvvm from '@/front/Mvvm'
import PagePart from '@/front/PagePart'
import FurnFram from '@/front/FurnFram'
import Tool from '@/com/Tool'
import Mats from "@/com/Mats"


//家具类型
const {furnTypes,furnsData}=FurnFram;
//图形相关的部分
const webglPart=new WebglPart(document.getElementById('view'));
//双向绑定器
const mvvm=new Mvvm({webglPart});
//页面相关部分
const page=new PagePart(FurnFram);

/*-------webglPart-------*/
webglPart.init();
//当家具创建完成后
webglPart.transCtrl2.addEventListener('crted',()=>{
    //取消当前按钮的激活
    page.unactFurn();
    //当前家具相关信息置空
    page.clearCurFurnInfo();
});
//家具取消选择的方法，置空furnForm
webglPart.transCtrl2.addEventListener('unselected',()=>{
    if(!webglPart.transCtrl2.crting){
        page.furnForm.innerHTML='';
    }
});
//家具选择方法，显示所选家具的表单属性furnForm
webglPart.transCtrl2.addEventListener('selected',(event)=>{
    page.object=event.value;
    page.curFurnName=event.value.name;

    page.updateFrom();
    mvvm.updateSubs(page.getInpsDom(),webglPart.transCtrl2.object);
});
//模型移动事件
webglPart.transCtrl2.addEventListener('position-change',(event)=>{
    mvvm.notify(webglPart.transCtrl2.object);
});

//页面相关
//家具属性表单值改变的情况，值是被验证过的有效值
//触发事件：selection 下拉列表的单击；input 键盘抬起后的有效数据
page.onFurnAttrChange=(key,val)=>{
    webglPart.transCtrl2.object[key]=val;
    //虚拟边界的更新
    if(webglPart.transCtrl2.crting){
        webglPart.transCtrl2.transformNeedUpdateOnMove=true;
    }else{
        webglPart.transCtrl2.updateTransformAttrByObj();
    }
    webglPart.render();
};
page.onCrtFurn=(curFurnName,furnDefaultValue,inpsDom)=>{
    webglPart.crtFurn(curFurnName,furnDefaultValue);
    page.object=webglPart.transCtrl2.object;

};
page.onCrtForm=(inpsDom)=>{
    mvvm.updateSubs(inpsDom,webglPart.transCtrl2.object);
}



/*//初始化节点高度
page.initDomSize();
//初始化家具类型
page.updateFurnType(furnTypes);
//初始化家具按钮
page.updateFurnBtns();*/


