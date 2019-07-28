import Mats from '@/com/Mats'

const FurnFram={
    //家具类型，其键是唯一的
    furnTypes:{
        fttg:{text:'分体厅柜',chidren:['DiTai','DiGui']},
        zttg:{text:'整体厅柜',chidren:['DiTai']},
    },
    furnsData:{
        //地柜
        DiGui:{
            label:'地柜',
            form:livForm({
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
            })
        },
        //地台
        DiTai:{
            label:'地台',
            form:livForm({
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
            })
        },
    }
};
export default FurnFram;

/*属性相关*/
function livForm(obj){
    obj.x=posParam({label:'x'});
    obj.y=posParam({label:'y'});
    obj.z=posParam({label:'z'});
    return obj;
}
/* 参数相关 */
function sizeParam(param){
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
    };
    let newList={};
    param.list.forEach((num)=>{
        num=num.toString();
        newList[num]={text:num}
    });
    param.list=newList;
    for(let key in param){
        def[key]=param[key];
    }
    return def;
}
function posParam(param){
    let def={
        value:'',
        label:'标签',
        inputType:'input',
        valType:'number',
    };
    for(let key in param){
        def[key]=param[key];
    }
    return def;
}
function matParam(param){
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
    };
    //加工list
    let newList={};
    param.list.forEach((str)=>{
        newList[str]={text:Mats[str].text}
    });
    param.list=newList;
    for(let key in param){
        def[key]=param[key];
    }
    return def;
}
