import {MeshLambertMaterial, MeshPhongMaterial} from "three";
import Conf from '@/com/Conf'
const unit=Conf.unit;

const Tool={
    //尚未适用
    matStorage:{
        MeshLambertMaterial,
        MeshPhongMaterial,
    },
    //解析数据，换算单位
    //表单数据到实物数据
    parseUnit:(num)=>{
        return Math.floor(parseFloat(num))*unit;
    },
    //实物数据到表单数据
    parseInp(num){
        return Math.floor(parseFloat(num)/unit);
    }
};
export default Tool;