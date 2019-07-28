import Mats from "@/com/Mats"

const FurnData={
    livForm:(obj)=>{
        obj.x=FurnData.posParam({label:'x'});
        obj.y=FurnData.posParam({label:'y'});
        obj.z=FurnData.posParam({label:'z'});
        return obj;
    },
    sizeParam:(param)=>{
        let def={
            //默认值
            value:30,
            //标签
            label:'标签',
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
            newList[num]={text:num}
        });
        param.list=newList;
        for(let key in param){
            def[key]=param[key];
        }
        return def;
    },
    posParam:(param)=>{
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
    },
    matParam:(param)=>{
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
    },
    parseList:(list,fn)=>{
        let newList={};
        list.forEach((ele)=>{
            fn(str);
        });
        return newList;
    }

};
export default FurnData;