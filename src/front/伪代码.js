import Mats from '@/com/Mats'

const data={
    //家具类型，其键是唯一的
    furnTypes:{
        fttg:{text:'分体厅柜',chidren:['Ditai','Digui']},
        zttg:{text:'整体厅柜',chidren:['Ditai']},
    },
    furnsData:{
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
                    //若存在数字类型的下拉列表，将数字转字符串变成键
                    //list:{''30':{text:'30'}},
                    //list:{'huTao':{text:'胡桃木'}},
                    list:['huTao','pingGuo'],
                })
            }
        },
    }
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
        min:0,
        //最大值
        max:2112
    }
    for(let key in param){
        def[key]=param[key];
    }
    return def;
}
function posParam(){

}
function matParam(param){
    //预定义数据
    let def={
        //默认值
        value:'huTao',
        //标签
        label:'材质标签',
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
    //数据合成
    for(let key in param){
        def[key]=param[key];
    }
    return def;
}