/*
* 铝框部件
* */
import BoxMesh  from '../Objects/BoxMesh'
import DiTai from "@/furns/DiTai";


//模型数据关联表单数据
class LvKuang extends BoxMesh{
    constructor(width,depth){
        super();
        this.neiSuo=4;//铝框內缩
        this.width=this.getSize(width);
        this.height=25;
        this.depth=this.getSize(depth);
        this.init();
        this.name='lvK';
        this.position.x=this.neiSuo;
        this.position.z=this.neiSuo;
        this.setMaterial('lvMoSha');
    }
    setW(val){
        this.width=this.getSize(val);
        this.updateBySize();
    }
    setD(val){
        this.depth=this.getSize(val);
        this.updateBySize();
    }
    //铝框宽
    getSize(size){
        return parseInt(size)-this.neiSuo*2;
    }
}
LvKuang.text='铝框';
export default LvKuang;










