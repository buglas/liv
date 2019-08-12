/*
* 分体厅柜-地台
* 形参{}
* w h d
* {
* */
import BoxMesh  from '../Objects/BoxMesh'
import Tool from '@/com/Tool'
import MatTool from "@/com/MatTool";
import FurnData from '@/com/FurnData'
import Furn from '@/core/Furn'
import LvKang from '@/parts/LvKuang'

//模型数据关联表单数据
const {livForm,sizeParam,matParam}=FurnData;
class DiGui extends Furn{
    constructor(param=null){
        super();
        //此中已有的参数是为常数，即不会出现在表单中定制
        this.name='DiGui';
        this.text='地柜';
        //网格对象缓存起来，方便再次加载
        //铝框
        this.lvKuang=null;
        //左侧板
        this.ceBanL=null;
        //右侧版
        this.ceBanR=null;
        //中竖版1
        this.zZhShuBan1=null;
        //中竖版2
        this.zhShuBan2=null;
        //顶板
        this.DingBan=null;
        //底板
        this.DiBan=null;
        //台面
        this.taiMian=null;
        this.init();
    }
    //初始化data 数据
    initData(){
        let _this=this;
        this.data=livForm(this,{
            width:sizeParam({
                label:'宽度',
                value:450,
                min:450,
                list:[450,600,900,1200,1350,1500,1800],
                set:(val)=>{
                    _this.getObjectByName('lvK').setW(val);
                    _this.getObjectByName('taiM').setW(val);
                }
            }),
            height:sizeParam({
                label:'高度',
                value:176,
                min:176,
                list:[176,352,528,704,880,1056,1408,1760,2112],
                set:(val)=>{
                    _this.getObjectByName('taiM').setH(val);
                }
            }),
            depth:sizeParam({
                label:'深度',
                value:322,
                min:298,
                list:[298,394,586],
                set:(val)=>{
                    _this.getObjectByName('lvK').setD(val);
                    _this.getObjectByName('taiM').setD(val);
                }

            }),
            mat:matParam({
                value:'huTao',
                label:'地柜材质',
                list:['huTao','pingGuo'],
                set:(val)=>{
                    let taiM=_this.getObjectByName('taiM');
                    MatTool.parseMat(val,(matParam)=>{
                        taiM.setMaterial(matParam);
                        _this.matParsed();
                    });
                }
            })
        })
    }
    //初始化模型
    initMesh(){
        let {width,depth,height}=this;
        //地脚
        let meshLvK=new LvKang(width,depth);
        this.add(meshLvK);
        //台面
        let meshTaiM=new BoxMesh(width,height,depth);
        meshTaiM.name='taiM';
        meshTaiM.translateY(meshLvK.height);
        this.add(meshTaiM);
        //用get 事件的值触发set 事件
        this.mat=this.mat;
    }
    //铝框宽
    getLw(){
        return this.width-this.ls*2;
    }
    //铝框身
    getLd(){
        return this.depth-this.ls*2;
    }
}
DiTai.text='地柜';
export default DiGui;










