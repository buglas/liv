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
    parseUnit:(num)=>{
        return parseFloat(num)*unit;
    }
};
export default Tool;