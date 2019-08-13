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
    },
    parseDegree(radian){
        return Math.round(radian*180/Math.PI);
    },
    parseRadian(degree){
        return Math.round(degree)*Math.PI/180;
    },
    //深拷贝
    deepCopy(obj) {
        let result = Array.isArray(obj) ? [] : {};
        for (let key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (typeof obj[key] === 'object' && obj[key]!==null&& obj[key].constructor.name!='HTMLImageElement') {
                    result[key] = Tool.deepCopy(obj[key]);   //递归复制
                } else {
                    result[key] = obj[key];
                }
            }
        }
        return result;
    }
};
export default Tool;
