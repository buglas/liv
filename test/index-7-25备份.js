import WebglPart from '@/front/WebglPart'
import Mvvm from '@/front/Mvvm'
import Tool from '@/com/Tool'
import Mats from "@/com/Mats"

//全局对象
//图形相关的部分
const webglPart=new WebglPart(document.getElementById('view'));
//双向绑定器
const mvvm=new Mvvm({webglPart});

//家具类型
const furnTypes={
    //value 是当前类型的默认
    fttg:{text:'分体厅柜',chidren:['DiTai','DiGui']},
    zttg:{text:'整体厅柜',chidren:['DiTai']}
};

//所有家具数据
const furnsData={
    //地柜
    DiGui:{
        label:'地柜',
        form:{
            heightTaimian:sizeParam({
                label:'台面高度',
                value:16,
                list:[16,18,30,50],
            }),
            width:sizeParam({
                label:'宽度',
                value:450,
                list:[450,600,900,1200,1350,1500,1800],
            }),
            height:sizeParam({
                label:'高度',
                value:176,
                list:[176,352,528,704,880,1056,1408,1760,2112],
            }),
            depth:sizeParam({
                label:'深度',
                value:298,
                list:[298,394,586],
            }),
        }
    },
    //地台
    DiTai:{
        label:'地台',
        form:{
            width:sizeParam({
                label:'宽度',
                value:400,
                list:[400,600,900,1200,1350,1500,1650,1800],
            }),
            height:sizeParam({
                label:'高度',
                value:30,
                list:[30,50,100],
            }),
            depth:sizeParam({
                label:'深度',
                value:322,
                list:[322,418,610],
            }),
            taiMat:matParam({
                value:'pingGuo',
                label:'台面材质',
                list:['huTao','pingGuo'],
            })
        }
    },
};

//家具默认参数,furnsData 中解析出来
let furnDefaultValue={};

//当前家具类型
let curType='fttg';
//当前家具名称，默认null
//此属性的赋值，受家具按钮的点击影响，受家具模型的选择影响
//此属性的置空不受家具按钮影响
let curFurnName=null;
//当前操作的input 节点
let curInpDom=null;
//当前inp 值
let inpVal=null;
//当前选择的家具节点
let curFurnBtn=null;

//整个撑开body的东东
let prop=document.getElementById('prop');
//下方内容
let bottomCont=document.getElementById('bottomCont');
//工具栏高度
let toolbarH=document.getElementById('toolbar').clientHeight;
//生产面板
let panelCrt=document.getElementById('panelCrt');
//下拉列表
let livList=document.getElementById('livList');
//家具类型
let furnType=document.getElementById('furnType');
//家具节点
let furnsBtns=document.getElementById('furns');
//家具的表单
let furnForm=document.getElementById('furnForm');



/*----------初始化页面----------*/
initPage();

/*----------家具按钮的操作----------*/
furnsBtns.addEventListener('click',onFurnClick);

/*----------表单的操作----------*/
//生产面板
panelCrt.addEventListener('mousedown',onPanelMousedown);
panelCrt.addEventListener('keydown',onPanelKeydown,true);
panelCrt.addEventListener('keyup',onPanelKeyup);
panelCrt.addEventListener('change',onPanelChange);
//其它地方点击时，若下拉列表显示，就隐藏
prop.addEventListener('mousedown',onPropMousedown);
//下拉列表的点击选择
livList.addEventListener('click',onListClick);

/*----------页面的操作----------*/
//页面变化 onWinResize
window.addEventListener( 'resize',onWinResize);
//生成面板的折叠
let dragArrow=document.getElementById('dragArrow');
let panelCrtWrapper=document.getElementById('panelCrtWrapper');
dragArrow.addEventListener('click',onDragArrowClick);

/*..........初始化方法..........*/
 initPage(){
    //初始化节点高度
    initDomSize();
    //初始化家具类型
    updateFurnType();
    //初始化家具按钮
    updateFurnBtns();
    //初始化webgl
    initWebglPart();
    
}
//初始化节点高度
 initDomSize(){
    let winH=window.innerHeight;
    prop.style.height=winH+'px';
    bottomCont.style.height=winH-toolbarH+'px';
    prop.style.opacity='1';
}
//初始化家具类型
 updateFurnType(){
    furnType.setAttribute('key',curType);
    furnType.value=furnTypes[curType].text;
}
//初始化家具按钮
 updateFurnBtns(){
    furnsBtns.innerHTML='';
    let fragment = '';
    furnTypes[curType].chidren.forEach((key)=>{
        fragment+=`<div class="furn" name="${key}">${furnsData[key].label}</div>`;
    });
    furnsBtns.innerHTML=fragment;
}
//初始化图形对象
 initWebglPart(){
    //布景
    webglPart.init();
    //当家具创建完成后
    webglPart.transCtrl2.addEventListener('crted',()=>{
        //取消当前按钮的激活
        unactFurn();
        //当前家具相关信息置空
        clearCurFurnInfo();
    });
    //家具取消选择的方法，置空furnForm
    webglPart.transCtrl2.addEventListener('unselected',()=>{
        if(!webglPart.transCtrl2.crting){
            furnForm.innerHTML='';
        }
    });
    //家具选择方法，显示所选家具的表单属性furnForm
    webglPart.transCtrl2.addEventListener('selected',(event)=>{
        curFurnName=event.value.name;
        updateFromByObj(event.value);
        mvvm.resetProxy(getInpsDom());

    })
}

/*..........家具方法..........*/
//家具点击
 onFurnClick(event){
    let node=findNode(event.target,event.currentTarget,'furn');
    if(node){
        curFurnName=node.getAttribute('name');
        //家具按钮效果
        setFurnBtnStyle(node);
        //显示相应表单,并附带填补furnDefaultValue
        updateFromByData();
        //创建家具(家具名称)
        webglPart.crtFurn(curFurnName,furnDefaultValue);
        //完善绑定数据[{dom:节点,value:值,key:属性}]
        //根据表单，建立绑定关系集合
        mvvm.resetProxy(getInpsDom());
    }
}
//家具按钮效果
 setFurnBtnStyle(node){
    if(curFurnBtn){
        curFurnBtn.setAttribute('class','furn');
    }
    node.setAttribute('class','furn btn-act');
    curFurnBtn=node;
}
//在创建家具时，根据数据，显示相应表单
 updateFromByData(){
    //初始化家具默认值
    initFurnDefaultValue();
    //置空家具属性表单
    furnForm.innerHTML='';
    //充实家具表单
    let fragment = '';
    //遍历家具表单的属性
    forEachForm((key,param)=>{
        fragment+=furnInp(param,key);
    });
    furnForm.innerHTML=fragment;
}
//在选择家具时，根据对象，显示相应表单
 updateFromByObj(obj){
    //根据家具数据，结合实体家具的属性建立表单
    //遍历家具表单的属性
    let fragment = '';
    forEachForm((key,param)=>{
        //将数字类型的值进行实物到表单的解析
        console.log('key',key);
        console.log('obj[key]',obj[key]);
        let val=parseFurnParam(param.valType,obj[key],'parseInp');
        console.log('val',val);
        fragment+=furnInp(param,key,val);
    });
    furnForm.innerHTML=fragment;
}
//初始化家具默认值
 initFurnDefaultValue(){
    //置空furnDefaultValue
    furnDefaultValue={};
    forEachForm((key,param)=>{
        furnDefaultValue[key]=parseFurnParam(param.valType,param.value);
    });
}
//遍历家具表单的属性
 forEachForm(fn){
    let furnFormData=furnsData[curFurnName].form;
    for(let key in furnFormData){
        fn(key,furnFormData[key]);
    }
}
//根据不同的类型，建立不同的输入框
 furnInp(param,key,value=null){
    //前端数据和图形数据相互补全
    //furnDefaultValue[key]=Tool.parseUnit(param.value);
    if(value===null){value=param.value}
    let fragment='';
    switch (param.inputType){
        case 'input':
            fragment=inputFragment(param.label,param.valType,key,value);
            break;
        case 'selection':
            let text=param.list[param.value].text
            fragment=selectionFragment(param.label,param.valType,key,value,text);
            break;
    }
    return fragment;
}
 inputFragment(label,valType,key,value){
    return `
            <div class="liv-group">
                <label class="liv-lab">${label}</label>
                <input class="liv-inp liv-input" 
                        data-mold="input" 
                        data-valtype="${valType}" 
                        type="text" 
                        name="${key}" 
                        value="${value}"
                >
            </div>
        `;
}
 selectionFragment(label,valType,key,value,text){
    return `
            <div class="liv-group">
                <label class="liv-lab">${label}</label>
                <div class="liv-inp-wraper">
                    <input class="liv-inp liv-selection"
                            data-mold="selection"
                            data-valtype="${valType}"
                            type="text"
                            name="${key}"
                            data-value="${value}"
                            value="${text}">
                    <img class="liv-down" src="images/down.svg">
                </div>
            </div>
        `;
}
//取消当前家具按钮的激活
 unactFurn(){
    if(curFurnBtn){
        curFurnBtn.setAttribute('class','furn');
        curFurnBtn=null;
    }

}
//获取家具属性相关的dom 节点
 getInpsDom(){
    return furnForm.getElementsByTagName('input');
}
//当前家具相关信息置空
 clearCurFurnInfo(){
    //当前家具，默认null
    //点击家具按钮时，curFurnName 是家具按钮的名称
    //选择物体时，curFurnName 是所选物体的name
    //curFurnName=null;
    //当前操作的input 节点
    curInpDom=null;
    //当前inp 值
    inpVal=null;
    //当前选择的家具节点
    curFurnBtn=null;
}
//解析下拉列表数据的value，获取其显示在文本款里的正确文字
 parseValue(param){
    if(typeof param.list[0]==='object'){
        return findAByB(param.list,'text','value',param.value);
    }else{
        return param.value;
    }
}
//解析输入框数据
 parseFurnParam(valType,val,numFn='parseUnit'){
    switch (valType){
        case 'number':
            return Tool[numFn](val);
            break;
        default:
            return val;
    }
}
 findAByB(list,a,b,value){
    let res='';
    for(let option of list){
        if(option[b]===value){
            res=option[a];
            break
        }
    }
    return res;
}

/*..........表单方法..........*/
//input 输入框的点击事件
 onPanelMousedown(event){
    if(hasClass(event.target,'liv-inp')){
        event.stopPropagation();
        if(livList.style.display==='block'&&curInpDom===event.target){
            //如果下拉列表存在，且当前input 和现在点击的input 是同一个
            //下拉列表隐藏
            livList.style.display='none';
        }else{
            curInpDom=event.target;
            inpVal=curInpDom.value;
            //设置下拉列表内容
            setSelectionCont();
            //显示下拉列表
            showSelection(curInpDom);
        }
    }
}
//面板的键盘按下
 onPanelKeydown(event){
    if(event.target.nodeName==='INPUT'){
        //输入框键盘按下后阻止扩散
        event.stopPropagation();
    }
}
//面板的键盘抬起
 onPanelKeyup(event){
    if(!curInpDom){return}
    let mold=event.target.getAttribute('data-mold');
    if(mold==='input'){
        //手动输入框
        onInputKeyup(event);
    }else if(mold==='selection'){
        //下拉列表的输入框的键盘抬起
        onSelectionKeyup(event);
    }
}
//手动输入框的键盘抬起
 onInputKeyup(event){
    let val=curInpDom.value;
    if(inpVal===val){return}
    let valid=checkVal();
    if(valid.value){
        console.log('val',val);
        onInputKeyupValid(val);
    }else{
        //onInputKeyupUnvalid(val);
    }
}
//下拉列表不可手动输入
 onSelectionKeyup(event){
    curInpDom.value=inpVal;
}
//面板中input 的change
 onPanelChange(event){
    if(event.target.getAttribute('data-mold')==='input'){
        //input 输入框手动输入,change 后,判断有效性
        if(!checkVal().value){
            curInpDom.value=inpVal;
        }
    }
}
//其它地方点击
 onPropMousedown(event){
    if(curInpDom){
        curInpDom.blur();
    }
    if(livList.style.display==='block'){
        livList.style.display='none';
    }
}
//下拉列表的点击选择
 onListClick(event){
    let tar=event.target;
    console.log('---------------------------------');
    console.log('curInpDom.value',curInpDom.value);
    console.log('tar.innerHTML',tar.innerHTML);
    if(curInpDom.value!==tar.innerHTML){
        //console.log('curInpDom',curInpDom);
        //console.log('tar.innerHTML',tar.innerHTML);
        //输入框的值不等于option 的内容
        curInpDom.value=tar.innerHTML;
        
        curInpDom.setAttribute('data-value',tar.getAttribute('data-value'));
        if(curInpDom.getAttribute('id')==='furnType'){
            //初始化furns
            updateFurnBtns();
            //置空furnForm
            furnForm.innerHTML='';
        }else{
            //如果是正常家具属性的selection
            //触发mvvm 事件
            //console.log('----dispachFromInp');
            dispachFromInp();
        }
    }
    livList.style.display='none';
}
//从表单里解析数据
 dispachFromInp(){
    let name=curInpDom.getAttribute('name');
    //数据类型，用于数据解析
    let valtype=curInpDom.getAttribute('data-valtype');
    //selection 情况下与中文text 对应的键
    let dataValue=curInpDom.getAttribute('data-value');
    //针对input和selection 的值进行取舍判断
    let furnVal=dataValue?dataValue:curInpDom.value;
    //let val=parseFurnParam(valtype,curInpDom.value);
    let val=parseFurnParam(valtype,furnVal);

    onFurnAttrChange(name,val);
}
//设置下拉列表内容
 setSelectionCont(){
    let name=curInpDom.getAttribute('name');
    if(name==='furnType'){
        crtList(furnTypes);
    }else{
        crtList(getCurFurnAttrList());
    }
}

//建立list
 crtList(list){
    livList.innerHTML='';
    let fragment = '';
    for(let key in list){
        let option=`<div class="option" data-value="${key}">${list[key].text}</div>`;
        fragment+=option;
    }
    livList.innerHTML=fragment;
}
//获取当前家具属性的list
 getCurFurnAttrList(){
    return furnsData[curFurnName].form[curInpDom.getAttribute('name')].list;
}
//显示下拉列表
 showSelection(curInpDom){
    let recInp=curInpDom.getBoundingClientRect();
    let recList=livList.getBoundingClientRect();
    livList.style.left=recInp.left+'px';
    if(recList.height<recInp.bottom){
        livList.style.top=recInp.bottom+'px';
    }else{
        livList.style.top=recInp.top-recList.height+'px';
    }
    livList.style.display='block';
}
//测试数据有效性, 返回Boolean
 checkVal(){
    let val=curInpDom.value;
    let dt=furnsData[curFurnName].form[curInpDom.getAttribute('name')];
    //value：是否有效
    //其余的：犯了哪种错
    //{value:boolean,,max:boolean,min:boolean,type,reg}
    let valid={value:true,max:false,min:false,type:false,reg:false};
    if(dt.valType==='number'){
        //判断是否为number
        //有理数
        let rational=/^(-?\d*)\.?\d+$/;
        if(rational.test(val)){
            //是数字
            let num=parseFloat(val);
            if(dt.min!==undefined &&num<dt.min){
                valid.value=false;
                valid.min=true;
            }else if(dt.max!==undefined&&num>dt.max){
                valid.value=false;
                valid.max=true;
            }
        }else{
            valid.value=false;
            valid.type=true;
        }
    }
    //正则验证
    if(dt.reg&&!dt.reg.test(val)){
        valid.value=false;
        valid.reg=true;
    }
    return valid;
}
//键盘在input 型输入框抬起时，值有效
 onInputKeyupValid(val){
    //更新当前值
    inpVal=val;
    curInpDom.setAttribute('data-value',val);
    //显示下拉列表
    crtList(getCurFurnAttrList());
    //触发mvvm 事件
    dispachFromInp();
    
}
//键盘在input 型输入框抬起时，值无效
 onInputKeyupUnvalid(val){
    //还原表单值
    if(val===''){
        //若值为空字符
        //当前输入框的值就是空字符
        curInpDom.value='';
        //显示下拉列表
        //normalSelection();
        crtList(getCurFurnAttrList());
        //当change 时，会将输入框内容还原到缓存的有效值 inpVal
    }else{
        //非字符串的空
        //将输入框内容还原到缓存的有效值 inpVal
        curInpDom.value=inpVal;
    }
}
//家具属性表单值改变的情况，值是被验证过的有效值
//触发事件：selection 下拉列表的单击；input 键盘抬起后的有效数据
 onFurnAttrChange(key,val) {
    console.log(key,val);
    mvvm[key]=val;
    //虚拟边界的更新
    if(webglPart.transCtrl2.crting){
        webglPart.transCtrl2.transformNeedUpdateOnMove=true;
    }else{
        webglPart.transCtrl2.updateTransformAttrByObj();
    }
    webglPart.render();
}

/*..........页面方法..........*/
//设置dom 高度自适应
 onWinResize(){
    let winH=window.innerHeight;
    prop.style.height=winH+'px';
    bottomCont.style.height=winH-toolbarH+'px';

}
//生成面板的折叠
 onDragArrowClick(){
    if(panelCrtWrapper.getAttribute('class')==='fold'){
        panelCrtWrapper.setAttribute('class','');
    }else{
        panelCrtWrapper.setAttribute('class','fold');
    }
}

/*..........常用方法..........*/

/* 参数相关 */
 sizeParam(param){
    let def={
        //默认值
        value:30,
        //标签
        label:'尺寸标签',
        //定制选项
        list:[400,600,900,1200,1350,1500,1650,1800],
        //输入框类型，selection
        inputType:'input',
        //数据类型，应对手动输入的input 状态
        valType:'number',
        //正则，正整数
        reg:/^[1-9]\d*$/,
        //最小值
        min:30,
        //最大值
        max:2112
    }
    let newList={};
    param.list.forEach((num)=>{
        num=num.toString();
        newList[num]={text:num}
    })
    param.list=newList;
    for(let key in param){
        def[key]=param[key];
    }
    return def;
}
 posParam(){

}
 matParam(param){
    let def={
        //默认值
        value:'huTao',
        //标签
        label:'材质标签',
        //定制选项
        list:['huTao','pingGuo'],
        //输入框类型，selection
        inputType:'selection',
        //数据类型，应对手动输入的input 状态
        valType:'string'
    }
    //加工list
    let newList={};
    param.list.forEach((str)=>{
        newList[str]={text:Mats[str].text}
    })
    param.list=newList;
    for(let key in param){
        def[key]=param[key];
    }
    return def;
}

/* 节点相关 */
//查找父级，根据class
 findNode(target,root,val,attr='class'){
    let find=null;
    const findParent=(node)=>{
        if(node.getAttribute(attr)===val){
            find=node;
        }else if(node!==root){
            findParent(node.parentNode);
        }
    };
    findParent(target);
    return find;
}
//判断是否有 class
 hasClass(target,val){
    return target.getAttribute('class').split(' ').indexOf(val)!==-1
}





