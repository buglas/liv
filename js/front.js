//数据
const furnTypes={
    //value 是当前类型的默认
    fttg:{text:'分体厅柜',value:0,chidren:['ditai','www']},
    zttg:{text:'整体厅柜',chidren:['www']}
}
//所有家具数据
const furns={
    //地台
    ditai:{
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
                list:[400,600,900,1200,1350,1500,1650,1800],
            }),
        }
    }
}
//当前操作的input 节点
let curInpDom=null;
//当前值
let curInpVal=null;
//当前家具类型
let curType='fttg';
//当前家具，默认null
let curFurn='ditai';
//下拉列表
let livList=document.getElementById('livList');

/*----------表单的操作----------*/
//生产面板
let panelCrt=document.getElementById('panelCrt');
panelCrt.addEventListener('mousedown',onPanelMousedown);
panelCrt.addEventListener('keydown',onPanelKeydown,true);
panelCrt.addEventListener('keyup',onPanelKeyup);
panelCrt.addEventListener('change',onPanelChange);
//其它地方点击时，若下拉列表显示，就隐藏
let prop=document.getElementById('prop');
prop.addEventListener('mousedown',onPropMousedown);
//下拉列表的点击选择
livList.addEventListener('click',onListClick);


//生成面板的折叠
$('#dragArrow').click(function(){
    $('#panelCrtWrapper').toggleClass('fold');
})

/*----------家具按钮的操作----------*/
let furnsDom=document.getElementById('furns');
furnsDom.addEventListener('click',onFurnClick);

//input 输入框的点击事件
function onPanelMousedown(event){
    if(hasClass(event.target,'liv-inp')){
        event.stopPropagation();
        if(livList.style.display==='block'&&curInpDom===event.target){
            livList.style.display='none';
        }else{
            curInpDom=event.target;
            curInpVal=curInpDom.value;
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
    if(curInpVal===val){return}
    let valid=checkVal();
    if(valid){
        //更新当前值
        curInpVal=val;
        //下拉列表
        normalSelection(curInpVal);
    }else{
        //还原表单值
        if(val===''){
            curInpDom.value='';
            normalSelection();
        }else{
            curInpDom.value=curInpVal;
        }
    }
}
//下拉列表不可手动输入
function onSelectionKeyup(event){
    curInpDom.value=curInpVal;
}
//input 输入框手动输入后,有效性验证
function onPanelChange(event){
    if(hasClass(event.target,'liv-input')){
        //手动输入框
        //input 输入框手动输入后,有效性验证
        if(!checkVal()){
            curInpDom.value=curInpVal;
        }
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
    curInpDom.value=tar.innerHTML;
    curInpDom.setAttribute('key',tar.getAttribute('value'));
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
    let dt=furns[curFurn].form[curInpDom.getAttribute('name')];
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
    let dt=furns[curFurn].form[curInpDom.getAttribute('name')];
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


//家具点击
function onFurnClick(event){
    let node=findNode(event.target,event.currentTarget,'furn');
    if(node&&curFurn!==name){
        let name=node.getAttribute('name');
        curFurn=name;
        $('.btn-act').removeClass('btn-act');
        $(node).addClass('btn-act');
    }
}
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


/*常用方法*/
//尺寸相关的参数
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
        max:2048,
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
