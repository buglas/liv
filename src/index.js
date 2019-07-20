import WebglPart from '@/front/WebglPart'
import Mvvm from '@/front/Mvvm'
import Tool from '@/com/Tool'

//全局对象
//图形相关的部分
let webglPart=new WebglPart(document.getElementById('view'));
//双向绑定器
let mvvm=new Mvvm({webglPart});
//家具默认参数
let furnDefaultParam={};

//家具类型
const furnTypes={
    //value 是当前类型的默认
    fttg:{text:'分体厅柜',chidren:['Ditai','Digui']},
    zttg:{text:'整体厅柜',chidren:['Ditai']}
};
//所有家具数据
const furnsData={
    //地柜
    Digui:{
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
    Ditai:{
        label:'地台',
        form:{
            width:sizeParam({
                label:'宽度',
                value:400,
                list:[400,600,900,1200,1350,1500,1650,1800],
            }),
            height:sizeParam({
                label:'高度',
                value:28,
                list:[30,50,100],
            }),
            depth:sizeParam({
                label:'深度',
                value:322,
                list:[322,418,610],
            }),
        }
    },
};


//当前家具类型
let curType='fttg';
//当前家具，默认null
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
function initPage(){
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
function initDomSize(){
    let winH=window.innerHeight;
    prop.style.height=winH+'px';
    bottomCont.style.height=winH-toolbarH+'px';
    prop.style.opacity='1';
}
//初始化家具类型
function updateFurnType(){
    furnType.setAttribute('key',curType);
    furnType.value=furnTypes[curType].text;
}
//初始化家具按钮
function updateFurnBtns(){
    furnsBtns.innerHTML='';
    let fragment = '';
    furnTypes[curType].chidren.forEach((key)=>{
        fragment+=`<div class="furn" name="${key}">${furnsData[key].label}</div>`;
    })
    furnsBtns.innerHTML=fragment;
}
//初始化图形对象
function initWebglPart(){
    //布景
    webglPart.init();
    //当家具创建完成后
    webglPart.transCtrl2.addEventListener('crted',()=>{
        //取消当前按钮的激活
        unactFurn();
        //当前家具相关信息置空
        //clearCurFurnInfo();
        
    })
}

/*..........家具方法..........*/
//家具点击
function onFurnClick(event){
    let node=findNode(event.target,event.currentTarget,'furn');
    let name=node.getAttribute('name');
    if(node){
        curFurnName=name;
        //家具按钮效果
        setFurnBtnStyle(node);
        //显示相应表单,并附带填补furnDefaultParam
        updateFrom();
        //创建家具(家具名称)
        webglPart.crtFurn(curFurnName,furnDefaultParam);
        //完善绑定数据[{dom:节点,value:值,key:属性}]
        //根据表单，建立绑定关系集合
        setSubs();
    }
}
//家具按钮效果
function setFurnBtnStyle(node){
    if(curFurnBtn){
        curFurnBtn.setAttribute('class','furn');
    }
    node.setAttribute('class','furn btn-act');
    curFurnBtn=node;
}
//家具属性中，显示相应表单
function updateFrom(){
    //置空furnDefaultParam
    furnDefaultParam={};
    //置空家具属性表单
    furnForm.innerHTML='';
    let furn=furnsData[curFurnName];
    let furnFormData=furn.form;
    let fragment = '';
    for(let key in furnFormData){
        fragment+=furnInp(furnFormData[key],key);
    }
    furnForm.innerHTML=fragment;
}
//根据不同的类型，建立不同的输入框
function furnInp(param,key){
    //前端数据和图形数据相互补全
    furnDefaultParam[key]=Tool.parseUnit(param.value);
    let fragment='';
    switch (param.inputType){
        case 'input':
            fragment=`
                <div class="liv-group">
                    <label class="liv-lab">${param.label}</label>
                    <input class="liv-inp liv-input" 
                            mold="input" 
                            type="text" 
                            name="${key}" 
                            value="${param.value}"
                    >
                </div>
            `;
            break;
        case 'selection':
            fragment=`
                <div class="liv-group">
                    <label class="liv-lab">${param.label}</label>
                    <div class="liv-inp-wraper liv-selection">
                        <input class="liv-inp liv-selection"
                                mold="selection"
                                type="text"
                                name="${key}"
                                value="${param.value}">
                        <img class="liv-down" src="images/down.svg">
                    </div>
                </div>
          `;
            break;
    }
    return fragment;
}
//取消当前家具按钮的激活
function unactFurn(){
    if(curFurnBtn){
        curFurnBtn.setAttribute('class','furn');
        curFurnBtn=null;
    }

}
//根据表单，建立绑定关系集合
function setSubs(){
    let inps=furnForm.getElementsByTagName('input');
    Array.prototype.forEach.call(inps,(ele)=>{
        let key=ele.getAttribute('name');
        //绑定关系集合
        mvvm.subs.push({dom:ele,value:ele.value,key:key});
        //设置mvvm对象的代理键
        mvvm.proxyKey(key);
    });
}
//当前家具相关信息置空
function clearCurFurnInfo(){
    //当前家具，默认null
    curFurnName=null;
    //当前操作的input 节点
    curInpDom=null;
    //当前inp 值
    inpVal=null;
    //当前选择的家具节点
    curFurnBtn=null;
}


/*..........表单方法..........*/
//input 输入框的点击事件
function onPanelMousedown(event){
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
function onPanelKeydown(event){
    if(event.target.nodeName==='INPUT'){
        //输入框键盘按下后阻止扩散
        event.stopPropagation();
    }
}
//面板的键盘抬起
function onPanelKeyup(event){
    if(hasClass(event.target,'liv-input')){
        //手动输入框
        onInputKeyup(event);
    }else if(hasClass(event.target,'liv-selection')){
        //下拉列表的输入框的键盘抬起
        onSelectionKeyup(event);
    }
}
//手动输入框的键盘抬起
function onInputKeyup(event){
    let val=curInpDom.value;
    if(inpVal===val){return}
    let valid=checkVal();
    if(valid){
        onInputKeyupValid(val);
    }else{
        onInputKeyupUnvalid(val);
    }
}
//下拉列表不可手动输入
function onSelectionKeyup(event){
    curInpDom.value=inpVal;
}
//面板中input 的change
function onPanelChange(event){
    if(hasClass(event.target,'liv-input')){
        //input 输入框手动输入,change 后,判断有效性
        if(!checkVal()){
            curInpDom.value=inpVal;
        }
        //input 输入框 改变后，改变家具尺寸

    }
}
//其它地方点击
function onPropMousedown(event){
    if(curInpDom){
        curInpDom.blur();
    }
    if(livList.style.display==='block'){
        livList.style.display='none';
    }
}
//下拉列表的点击选择
function onListClick(event){
    let tar=event.target;
    if(curInpDom.value!==tar.innerHTML){
        //输入框的值不等于option 的内容
        curInpDom.value=tar.innerHTML;

        if(curInpDom.getAttribute('id')==='furnType'){
            //如果是furnType 的selection
            //将option 的value 赋予input
            curType=tar.getAttribute('value');
            curInpDom.setAttribute('key',curType);
            //初始化furns
            updateFurnBtns();
            //置空furnForm
            furnForm.innerHTML='';
        }else{
            //如果是正常家具属性的selection
            onFurnAttrChange(curInpDom.getAttribute('name'),curInpDom.value)
        }
    }


    livList.style.display='none';
}
//设置下拉列表内容
function setSelectionCont(){
    let name=curInpDom.getAttribute('name');
    if(name==='furnType'){
        furnTypeSelection();
    }else{
        normalSelection();
    }
}
//家具类型下拉列表
function furnTypeSelection(){
    livList.innerHTML='';
    let fragment = '';
    for(let key in furnTypes){
        let option=`<div class="option" value="${key}">${furnTypes[key].text}</div>`;
        fragment+=option;
    }
    livList.innerHTML=fragment;
}
//家具属性下拉列表
function normalSelection(val=null){
    livList.innerHTML='';
    let fragment = '';
    let dt=furnsData[curFurnName].form[curInpDom.getAttribute('name')];
    dt.list.forEach((ele)=>{
        let str=ele.toString();
        if(!val||str.includes(val)){
            let option=`<div class="option">${ele}</div>`;
            fragment+=option;
        }
    })
    livList.innerHTML=fragment;
}
//显示下拉列表
function showSelection(curInpDom){
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
function checkVal(){
    let val=curInpDom.value;
    let dt=furnsData[curFurnName].form[curInpDom.getAttribute('name')];
    let valid=true;
    if(dt.valType==='number'){
        //判断是否为number
        //有理数
        let rational=/^(-?\d*)\.?\d+$/;
        if(rational.test(val)){
            //是数字
            let num=parseFloat(val);
            if(dt.min!==undefined &&num<dt.min||dt.max!==undefined&&num>dt.max){
                valid=false;
            }
        }else{
            valid=false;
        }
    }
    //正则验证
    if(dt.reg&&!dt.reg.test(val)){
        valid=false;
    }
    return valid;
}
//键盘在input 型输入框抬起时，值有效
function onInputKeyupValid(val){
    //更新当前值
    inpVal=val;
    //显示下拉列表
    normalSelection(inpVal);
    //触发mvvm 事件
    onFurnAttrChange(curInpDom.getAttribute('name'),val)
    
}
//键盘在input 型输入框抬起时，值无效
function onInputKeyupUnvalid(val){
    //还原表单值
    if(val===''){
        //若值为空字符
        //当前输入框的值就是空字符
        curInpDom.value='';
        //显示下拉列表
        normalSelection();
        //当change 时，会将输入框内容还原到缓存的有效值 inpVal
    }else{
        //非字符串的空
        //将输入框内容还原到缓存的有效值 inpVal
        curInpDom.value=inpVal;
    }
}
//家具属性表单值改变的情况，值是被验证过的有效值
//触发事件：selection 下拉列表的单击；input 键盘抬起后的有效数据
function onFurnAttrChange(key,val) {
    mvvm[key]=val;
    if(webglPart.transCtrl2.crting){
        console.log('transformNeedUpdateOnMove');
        webglPart.transCtrl2.transformNeedUpdateOnMove=true;
    }else{
        webglPart.transCtrl2.updateTransformAttrByObj();
    }
    webglPart.render();
}

/*..........页面方法..........*/
//设置dom 高度自适应
function onWinResize(){
    let winH=window.innerHeight;
    prop.style.height=winH+'px';
    bottomCont.style.height=winH-toolbarH+'px';

}
//生成面板的折叠
function onDragArrowClick(){
    console.log('www');
    if(panelCrtWrapper.getAttribute('class')==='fold'){
        panelCrtWrapper.setAttribute('class','');
    }else{
        panelCrtWrapper.setAttribute('class','fold');
    }
}

/*..........常用方法..........*/

/* 参数相关 */
function sizeParam(param){
    let def={
        //默认值
        value:30,
        //标签
        label:'宽度',
        //定制选项
        list:[400,600,900,1200,1350,1500,1650,1800],
        //输入框类型，selection
        inputType:'input',
        //数据类型，应对手动输入的input 状态
        valType:'number',
        //正则，正整数
        reg:/^[1-9]\d*$/,
        //最小值
        min:0,
        //最大值
        max:2112,
        //对应的dom 节点
        dom:null,
        //宽度改变时的
        chuange:function(){

        }
    }
    for(let key in param){
        def[key]=param[key];
    }
    return def;
}
function posParam(){

}
/* 节点相关 */
//查找父级，根据class
function findNode(target,root,val,attr='class'){
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
function hasClass(target,val){
    return target.getAttribute('class').split(' ').indexOf(val)!==-1
}





