/*
* 铝框部件
* */
import BoxMesh  from '../Objects/BoxMesh'
import DiTai from "@/furns/DiTai";


//模型数据关联表单数据
class LvKuang extends BoxMesh{
    constructor(width=null,depth=null){
        super();
        this.neiSuo=4;//铝框內缩
        this.height=25;
        this.name='lvK';
        this.x=this.neiSuo;
        this.z=this.neiSuo;
        if(width===null||depth===null){
            this.addEventListener('geometry-created',(event)=>{
                this.setMaterial('lvMoSha');
            })
        }else{
            this.width=this.getSize(width);
            this.depth=this.getSize(depth);
            this.setMaterial('lvMoSha');
        }

        //this.init();


    }
    setLvkW(val){
        this.width=this.getSize(val);
    }
    setLvkD(val){
        this.depth=this.getSize(val);
    }
    //铝框宽
    getSize(size){
        return Math.round(size)-this.neiSuo*2;
    }
}
LvKuang.text='铝框';
export default LvKuang;










