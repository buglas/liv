import Tool from "@/com/Tool";
import FurnLib from '@/furns/FurnLib'
import Conf from '@/com/Conf'

//家具的分类
const {furnTypes}=Conf;

export default class PagePart {
    constructor() {
        //整个撑开body的东东
        this.prop=document.getElementById('prop');
        //下方内容
        this.bottomCont=document.getElementById('bottomCont');
        //工具栏高度
        this.toolbarH=document.getElementById('toolbar').clientHeight;
        //工具栏里的工具按钮
        this.translateBtn=document.getElementById('translateBtn');
        this.rotateBtn=document.getElementById('rotateBtn');
        this.crashBtn=document.getElementById('crashBtn');
        this.floatBtn=document.getElementById('floatBtn');
        this.normalToolBtn='bar-btn';
        this.actToolClass='btn-act';
        this.actToolBtn='bar-btn btn-act';
        //视图按钮
        this.viewBtns=document.getElementById('viewBtns');
        this.viewBtnMain=document.getElementById('viewBtnMain');
        this.viewBtnsNormal=document.getElementById('viewBtnsNormal');
        //生产面板
        this.panelCrt=document.getElementById('panelCrt');
        //下拉列表
        this.livList=document.getElementById('livList');
        //家具类型
        this.furnType=document.getElementById('furnType');
        //家具节点
        this.furnsBtns=document.getElementById('furns');
        //家具的表单
        this.furnForm=document.getElementById('furnForm');
        //自定义属性，如尺寸、材质等
        this.customInps=document.getElementById('customInps');
        //变换属性，位置、旋转
        this.transInps=document.getElementById('transInps');
        //生成面板的折叠箭头
        this.dragArrow=document.getElementById('dragArrow');
        //生成面板
        this.panelCrtWrapper=document.getElementById('panelCrtWrapper');


        //建立当前域的属性
        //当前家具类型
        this.curType='fttg';
        //当前被选中的家具
        this.object=null;
        //当前家具名称，默认null
        //此属性的赋值，受家具按钮的点击影响，受家具模型的选择影响
        //此属性的置空不受家具按钮影响
        this.curFurnName=null;
        //当前操作的input 节点
        this.curInpDom=null;
        //当前inp 值
        this.inpVal=null;
        //当前选择的家具节点
        this.curFurnBtn=null;
        //家具默认参数,furnsData 中解析出来
        this.furnDefaultValue={};
        //公共属性，以做排除
        this.posAttr=['px','py','pz'];
        this.rotAttr=['rx','ry','rz'];
        this.comAttr=[...this.posAttr,...this.rotAttr];
        //视图集合
        this.views={p:'P',t:'T',f:'F',l:'L'};

        //与外部对接的方法
        this.onFurnAttrChange=()=>{};
        //将要建立家具的方法
        this.onCrtFurn=()=>{};
        //要建立表单的方法
        this.onCrtForm=()=>{};
        //控制器类型的变化
        this.onModeBtnChange=()=>{};
        //吸附的变化
        this.onCrashBtnChange=()=>{};
        //浮动的变化
        this.onFloatBtnChange=()=>{};
        //视图的变化
        this.onViewBtnChange=()=>{};

        //初始化
        this.init();
    }
    init(){
        //初始化页面方法
        this.initPage();
        //初始化事件
        this.initEvent();
    }

    //初始化页面方法
    initPage(){
        //初始化节点高度
        this.initDomSize();
        //初始化工具栏按钮

        //初始化视图按钮
        this.initViewBtns('p');
        //初始化家具类型
        this.updateFurnType();
        //初始化家具按钮
        this.updateFurnBtns();

    }
    //初始化事件
    initEvent(){
        let _this=this;
        /*----------页面的操作----------*/
        //页面变化 onWinResize
        window.addEventListener( 'resize',function(event){_this.onWinResize(event)});
        /*----------工具栏的操作----------*/
        this.translateBtn.addEventListener( 'click',function(event){_this.onModeBtnClick(event,'translate')});
        this.rotateBtn.addEventListener( 'click',function(event){_this.onModeBtnClick(event,'rotate')});
        this.floatBtn.addEventListener( 'click',function(event){_this.onFloatBtnClick(event,'crashable')});
        this.crashBtn.addEventListener( 'click',function(event){_this.onCrashBtnClick(event,'floatable')});
        /*----------视图的折叠----------*/
        this.viewBtns.addEventListener('click',function(event){_this.onViewBtnClick(event)});
        this.viewBtns.addEventListener('mouseover',function(event){_this.toggleViewBtn(event,'block')});
        this.viewBtns.addEventListener('mouseout',function(event){_this.toggleViewBtn(event,'none')});
        /*----------面板的折叠----------*/
        this.dragArrow.addEventListener('click',function(event){_this.onDragArrowClick(event)});
        /*----------家具按钮的操作----------*/
        this.furnsBtns.addEventListener('click',function(event){_this.onFurnClick(event)});
        /*----------表单的操作----------*/
        //生产面板
        this.panelCrt.addEventListener('mousedown',function(event){_this.onPanelMousedown(event)});
        this.panelCrt.addEventListener('keydown',function(event){_this.onPanelKeydown(event)},true);
        this.panelCrt.addEventListener('keyup',function(event){_this.onPanelKeyup(event)});
        this.panelCrt.addEventListener('change',function(event){_this.onPanelChange(event)});
        //其它地方点击时，若下拉列表显示，就隐藏
        this.prop.addEventListener('mousedown',function(event){_this.onPropMousedown(event)});
        //下拉列表的点击选择
        this.livList.addEventListener('click',function(event){_this.onListClick(event)});

    }

    /*..........========页面初始化方法========..........*/
    //初始化节点高度
    initDomSize(){
        let winH=window.innerHeight;
        this.prop.style.height=winH+'px';
        this.bottomCont.style.height=winH-this.toolbarH+'px';
        this.prop.style.opacity='1';
    }
    //初始化视图按钮
    initViewBtns(view){
        let views=this.views;
        this.viewBtnMain.setAttribute('data-value',view);
        this.viewBtnMain.innerHTML=views[view];
        let normalBtns='';
        for(let v in views){
            if(view===v){continue}
            normalBtns+=`<div class="view-btn" data-value="${v}">${views[v]}</div>`;
        }
        this.viewBtnsNormal.innerHTML=normalBtns;
    }
    //初始化家具类型
    updateFurnType(furnType=this.furnType,curType=this.curType,){
        furnType.setAttribute('key',curType);
        furnType.value=furnTypes[curType].text;
    }
    //初始化家具按钮
    updateFurnBtns(furnsBtns=this.furnsBtns,curType=this.curType){
        furnsBtns.innerHTML='';
        let fragment = '';
        furnTypes[curType].chidren.forEach((key)=>{
            let furn=FurnLib[key];
            if(furn){
                fragment+=`<div class="furn" name="${key}">${furn.text}</div>`;
            }else{
                console.error('furnTypes 里的家具和furnsData 里的家具名不匹配');
            }

        });
        furnsBtns.innerHTML=fragment;
    }

    /*..........========工具栏方法========..........*/
    onModeBtnClick(event,mode){
        let node=event.target;
        if(!this.hasClass(node,this.actToolClass)){
            this.onModeBtnChange(mode);
        }
    }
    onFloatBtnClick(event,name){
        this.onFloatBtnChange();
    }
    onCrashBtnClick(event,name){
        this.onCrashBtnChange();
    }

    /*..........========事件初始化方法========..........*/
    /*..........页面事件方法..........*/
    //设置dom 高度自适应
    onWinResize(event,prop=this.prop,bottomCont=this.bottomCont,toolbarH=this.toolbarH){
        let winH=window.innerHeight;
        prop.style.height=winH+'px';
        bottomCont.style.height=winH-toolbarH+'px';
        //更新表单的滚动状态
        this.updateFromScroll();

    }
    //视图按钮的点击
    onViewBtnClick(event){
        let view=event.target.getAttribute('data-value');
        this.initViewBtns(view);
        this.onViewBtnChange(view);
    }
    //视图按钮的显示隐藏
    toggleViewBtn(event,disp){
        this.viewBtnsNormal.style.display=disp;

    }

    //生成面板的折叠
    onDragArrowClick(event,panelCrtWrapper=this.panelCrtWrapper){
        if(panelCrtWrapper.getAttribute('class')==='fold'){
            panelCrtWrapper.setAttribute('class','');
        }else{
            panelCrtWrapper.setAttribute('class','fold');
        }
    }
    /*..........家具事件方法..........*/
    onFurnClick(event){
        //let node=this.findNode(event.target,event.currentTarget,'furn');
        let node=event.target;
        if(this.hasClass(node,'furn')){
            this.curFurnName=node.getAttribute('name');
            //家具按钮效果
            this.setFurnBtnStyle(node);
            //创建家具
            this.onCrtFurn(this.curFurnName);

            //显示相应表单
            this.updateFrom();

            //触发表单建成事件
            this.onCrtForm(this.getInpsDom());
            //更新家具属性面板的滚动状态
            //this.updateFromScroll();

        }
    }

    /*..........表单事件方法..........*/
    //input 输入框的点击事件
    onPanelMousedown(event,livList=this.livList){
        if(this.curInpDom){
            //如果在点击面板前，已经缓存过里一个input
            //检查和还原input值
            this.checkAndRestore();
        }
        if(this.hasClass(event.target,'liv-inp')){
            //如果点击在了input上
            event.stopPropagation();
            if(livList.style.display==='block'&&this.curInpDom===event.target){
                //如果下拉列表存在，且当前input 和现在点击的input 是同一个
                //下拉列表隐藏
                livList.style.display='none';
            }else{
                this.curInpDom=event.target;
                this.inpVal=this.curInpDom.value;
                //判断下拉列表的存在
                let name=this.curInpDom.getAttribute('name');
                if(name==='furnType'||this.object.data[name].list){
                    //设置下拉列表内容
                    this.setSelectionCont();
                    //显示下拉列表
                    this.showSelection(this.curInpDom);
                }
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
    onPanelKeyup(event,curInpDom=this.curInpDom){
        if(!curInpDom){return}
        let mold=event.target.getAttribute('data-mold');
        if(mold==='input'){
            //手动输入框
            this.onInputKeyup(event);
        }else if(mold==='selection'){
            //下拉列表的输入框的键盘抬起
            this.onSelectionKeyup(event);
        }
    }
    //面板中input 的change
    onPanelChange(event){
        if(event.target.getAttribute('data-mold')==='input'){
            //input 输入框手动输入,change 后,判断有效性
            this.checkAndRestore();
        }
    }
    //其它地方点击
    onPropMousedown(event,livList=this.livList,curInpDom=this.curInpDom){
        if(curInpDom){
            curInpDom.blur();
        }
        if(livList.style.display==='block'){
            livList.style.display='none';
        }
    }
    //下拉列表的点击选择
    onListClick(event,curInpDom=this.curInpDom){
        let tar=event.target;
        if(curInpDom.value!==tar.innerHTML){
            //输入框的值不等于option 的内容
            curInpDom.value=tar.innerHTML;
            curInpDom.setAttribute('data-value',tar.getAttribute('data-value'));
            if(curInpDom.getAttribute('id')==='furnType'){
                //初始化furnType
                this.updateFurnBtns();
                //置空furnForm
                this.clearFurnForm();
            }else{
                //如果是正常家具属性的selection
                //触发mvvm 事件
                this.dispachFromInp();
            }
        }
        livList.style.display='none';
    }

    /*''''''''''--------家具单击事件相关方法--------''''''''''*/
    /*--------onFurnClick--------*/
    //家具按钮效果
    setFurnBtnStyle(node,curFurnBtn=this.curFurnBtn){
        if(curFurnBtn){
            curFurnBtn.setAttribute('class','furn');
        }
        node.setAttribute('class','furn btn-act');
        this.curFurnBtn=node;
    }
    //在创建或选择家具时，根据数据，显示相应表单
    updateFrom(furnForm=this.furnForm){
        //置空家具属性表单
        this.clearFurnForm();
        //充实家具表单
        let fragment = '';
        //遍历家具表单的自有属性，建立相应表单
        this.forEachForm((key,param)=>{
            if(!this.comAttr.includes(key)){
                fragment+=this.furnInp(param,key,this.object[key]);
            }
        });
        //基于家具变换数据，建立表单
        fragment+=this.transInp(this.posAttr,'位置 X Y Z');
        fragment+=this.transInp(this.rotAttr,'旋转 X Y Z');
        furnForm.innerHTML=fragment;
        //更新表单的滚动状态
        this.updateFromScroll();
    }

    /*''''''''''--------表单事件相关方法--------''''''''''*/

    /*--------onPanelMousedown--------*/
    //设置下拉列表内容
    setSelectionCont(curInpDom=this.curInpDom){
        let name=curInpDom.getAttribute('name');
        if(name==='furnType'){
            this.crtList(furnTypes);
        }else{
            this.crtList(this.getCurFurnAttrList());
        }
    }
    //显示下拉列表
    showSelection(curInpDom,livList=this.livList){
        let recInp=curInpDom.getBoundingClientRect();
        livList.style.left=recInp.left+'px';
        livList.style.display='block';
        let recList=livList.getBoundingClientRect();
        let listH=recList.height;
        let recInpBottomDis=window.innerHeight-recInp.bottom;
        if(listH<recInpBottomDis){
            livList.style.top=recInp.bottom+'px';
        }else{
            livList.style.top=recInp.top-listH+'px';
        }
    }

    /*--------onPanelKeyup--------*/
    //手动输入框的键盘抬起
    onInputKeyup(event,curInpDom=this.curInpDom,inpVal=this.inpVal){
        let val=curInpDom.value;
        if(inpVal===val){return}
        let valid=this.checkVal();
        if(valid.value){
            this.onInputKeyupValid(val);
        }else{
            //onInputKeyupUnvalid(val);
        }
    }
    //下拉列表不可手动输入
    onSelectionKeyup(event){
        curInpDom.value=inpVal;
    }
    //键盘在input 型输入框抬起时，值有效
    onInputKeyupValid(val,curInpDom=this.curInpDom){
        //更新当前值
        this.inpVal=val;
        curInpDom.setAttribute('data-value',val);
        //显示下拉列表
        this.crtList(this.getCurFurnAttrList());
        //触发mvvm 事件
        this.dispachFromInp();

    }
    //建立list
    crtList(list,livList=this.livList){
        livList.innerHTML='';
        let fragment = '';
        for(let key in list){
            let option=`<div class="option" data-value="${key}">${list[key].text}</div>`;
            fragment+=option;
        }
        livList.innerHTML=fragment;
    }
    //从表单里解析数据
    dispachFromInp(curInpDom=this.curInpDom){
        let name=curInpDom.getAttribute('name');
        //数据类型，用于数据解析
        let valtype=curInpDom.getAttribute('data-valtype');
        //selection 情况下与中文text 对应的键
        let dataValue=curInpDom.getAttribute('data-value');
        //针对input和selection 的值进行取舍判断
        let furnVal=dataValue?dataValue:curInpDom.value;
        let val=this.parseFurnParam(valtype,furnVal);
        //家具属性表单值改变的情况，值是被验证过的有效值
        //触发事件：selection 下拉列表的单击；input 键盘抬起后的有效数据
        this.onFurnAttrChange(name,furnVal);
    }

    /*--------onPanelChange--------*/
    //检查和还原input值
    checkAndRestore(){
        if(!this.checkVal().value){
            this.curInpDom.value=this.inpVal;
        }
    }


    /*--------selected--------*/
    //在选择家具时，根据对象，显示相应表单
    //遍历家具表单的属性
    forEachForm(fn){
        let furnFormData=this.object.data;
        for(let key in furnFormData){
            fn(key,furnFormData[key]);
        }
    }
    //根据不同的类型，建立不同的输入框
    furnInp(param, key, value=null){
        //前端数据
        if(value===null){value=param.value}
        let fragment='';
        switch (param.inputType){
            case 'input':
                fragment=this.inputFragment(param.label,param.valType,key,value);
                break;
            case 'selection':
                let text=param.list[param.value].text;
                fragment=this.selectionFragment(param.label,param.valType,key,value,text);
                break;
        }
        return fragment;
    }
    //input 类型的输入框
    inputFragment(label, valType, key, value){
        return `
            <div class="liv-group">
                <label class="liv-lab">${label}</label>
                <input class="liv-inp liv-input" 
                        data-mold="input" 
                        data-valtype="${valType}" 
                        type="text" 
                        name="${key}" 
                        data-value="${value}"
                        value="${value}"
                >
            </div>
        `;
    }
    //下拉列表类型的输入框
    selectionFragment(label, valType, key, value, text){
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
    //一行多列的输入框，如位置、旋转
    transInp(arr,label){
        let row=this.transRow(arr);
        let fragment=`
            <label class="liv-lab">${label}</label>
            <div id="position" class="liv-divice-3">
                ${row}
            </div>
        `;
        return fragment;
    }
    transRow(arr){
        let row='';
        let _this=this;
        arr.forEach((ele)=>{
            let valType=_this.object.data[ele].valType;
            let value=_this.object[ele];
            row+=_this.transFragment(valType,ele,value);
        });
        return row;
    }
    transFragment(valType, key, value){
        return `
            <div class="liv-group">
                <input class="liv-inp liv-input" 
                        autocomplete="off"
                        data-mold="input" 
                        data-valtype="${valType}" 
                        type="text" 
                        name="${key}" 
                        data-value="${value}"
                        value="${value}"
                >
            </div>
        `;
    }
    /*'''''''''''''''''''''''''''''''''''''''''''''''''''*/

    /*-----------节点事件相关方法-----------*/
    setModeBtn(mode,oldMode){
        this[`${oldMode}Btn`].setAttribute('class',this.normalToolBtn);
        this[`${mode}Btn`].setAttribute('class',this.actToolBtn);
    }
    toggleBtn(name,val){
        if(val){
            this[`${name}Btn`].setAttribute('class',this.actToolBtn);
        }else{
            this[`${name}Btn`].setAttribute('class',this.normalToolBtn);
        }

    }

    /* ...数据运算相关... */
    //测试数据有效性, 返回Boolean
    checkVal(curInpDom=this.curInpDom,){
        let val=curInpDom.value;
        let dt=this.getCurFurnAttr();
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
    //解析输入框数据
    parseFurnParam(valType, val, numFn='parseUnit'){
        switch (valType){
            case 'number':
                return Tool[numFn](val);
            default:
                return val;
        }
    }

    /* ...节点相关... */
    updateFromScroll(){
        let pannelH=this.panelCrt.clientHeight;
        let btnsH=this.furnsBtns.clientHeight;
        let formH=pannelH-btnsH;
        this.furnForm.style.height=formH+'px';
    }
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
    //获取当前家具属性
    getCurFurnAttr(curInpDom=this.curInpDom){
        return this.object.data[curInpDom.getAttribute('name')];
    }
    //获取当前家具属性的list
    getCurFurnAttrList(){
        return this.object.data[this.curInpDom.getAttribute('name')].list;
    }
    //获取家具属性相关的dom 节点
    getInpsDom(furnForm=this.furnForm){
        return furnForm.getElementsByTagName('input');
    }
    //判断是否有 class
    hasClass(target, val){
        let cla=target.getAttribute('class');
        return cla&&cla.split(' ').indexOf(val)!==-1
    }
    //取消当前家具按钮的激活
    unactFurn(curFurnBtn=this.curFurnBtn){
        if(curFurnBtn){
            curFurnBtn.setAttribute('class','furn');
            curFurnBtn=null;
        }
    }
    //当前家具下相关信息置空，除了curFurnName
    clearCurFurnInfo(){
        //当前操作的input 节点
        this.curInpDom=null;
        //当前inp 值
        this.inpVal=null;
        //当前选择的家具节点
        this.curFurnBtn=null;
    }
    //置空家具表单
    clearFurnForm(){
        this.furnForm.innerHTML='';
    }
}
