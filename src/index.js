import WebglPart from '@/front/WebglPart'
import Mvvm from '@/front/Mvvm'
import PagePart from '@/front/PagePart'


//图形相关的部分
const webglPart=new WebglPart(document.getElementById('view'));

//双向绑定器
const mvvm=new Mvvm();
//页面相关部分
const page=new PagePart();

/*-------webglPart-------*/
webglPart.init();
const {transCtrl2}=webglPart;
webglPart.onViewChange=(view)=>{

};
//当家具创建完成后
transCtrl2.addEventListener('crted',()=>{
    //取消当前按钮的激活
    page.unactFurn();
    //当前家具相关信息置空
    page.clearCurFurnInfo();
});
//家具取消选择的方法，置空furnForm
transCtrl2.addEventListener('unselected',()=>{
    if(!transCtrl2.crting){
        page.furnForm.innerHTML='';
    }
});
//家具选择方法，显示所选家具的表单属性furnForm
transCtrl2.addEventListener('selected',(event)=>{
    page.object=event.value;
    page.curFurnName=event.value.name;

    page.updateFrom();
    mvvm.updateSubs(page.getInpsDom(),transCtrl2.object);
});
//模型移动事件
transCtrl2.addEventListener('transform-change',(event)=>{
    mvvm.notify(transCtrl2.object);
});
//模型变换
transCtrl2.addEventListener('mode-change',(event)=>{
    console.log('-----mode-change-----');
    page.setModeBtn(event.value,event.oldValue);
});
//模型吸附
transCtrl2.addEventListener('crashable-change',(event)=>{
    page.toggleBtn('crash',event.value);
});
//模型浮动
transCtrl2.addEventListener('floatable-change',(event)=>{
    page.toggleBtn('float',event.value);
});
//视图改变
transCtrl2.addEventListener('transform-change',(event)=>{

});


//页面相关
page.onModeBtnChange=(mode)=>{
    transCtrl2.setMode(mode);
};
page.onFloatBtnChange=()=>{
    transCtrl2.toggleFloatable();
};
page.onCrashBtnChange=()=>{
    transCtrl2.toggleCrashable();
};

//家具属性表单值改变的情况，值是被验证过的有效值
//触发事件：selection 下拉列表的单击；input 键盘抬起后的有效数据
page.onFurnAttrChange=(key,val)=>{
    transCtrl2.object[key]=val;
    //虚拟边界的更新
    if(transCtrl2.crting){
        transCtrl2.transformNeedUpdateOnMove=true;
    }else{
        transCtrl2.updateTransformAttrByObj();
    }
    webglPart.render();
};
page.onCrtFurn=(curFurnName,furnDefaultValue,inpsDom)=>{
    webglPart.crtFurn(curFurnName,furnDefaultValue);
    page.object=transCtrl2.object;

};
page.onCrtForm=(inpsDom)=>{
    mvvm.updateSubs(inpsDom,transCtrl2.object);
};



