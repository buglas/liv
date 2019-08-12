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
class DiTai extends Furn{
    constructor(param=null){
        super();
        //此中已有的参数是为常数，即不会出现在表单中定制
        this.name='DiTai';
        this.text='地台';
        //网格对象缓存起来，方便再次加载
        //铝框
        this.lvKuang=null;
        //台面
        this.taiMian=null;
        //初始化
        this.init();
    }
    //初始化data 数据
    initData(){
        let _this=this;
        this.data=livForm(this,{
            width:sizeParam({
                label:'宽度',
                value:400,
                min:400,
                list:[400,600,900,1200,1350,1500,1650,1800],
                set:(val)=>{
                    _this.lvKuang.setW(val);
                    _this.taiMian.setW(val);
                }
            }),
            height:sizeParam({
                label:'高度',
                value:30,
                list:[30,50,100],
                set:(val)=>{
                    _this.taiMian.setH(val);
                }
            }),
            depth:sizeParam({
                label:'深度',
                value:322,
                min:200,
                list:[322,418,610],
                set:(val)=>{
                    _this.lvKuang.setD(val);
                    _this.taiMian.setD(val);
                }
            }),
            mat:matParam({
                value:'huTao',
                label:'台面材质',
                list:['huTao','pingGuo'],
                set:(val)=>{
                    MatTool.parseMat(val,(matParam)=>{
                        _this.taiMian.setMaterial(matParam);
                        _this.matParsed();
                    });
                }
            })
        })
    }
    //初始化模型
    initMesh(){
        //用get 事件的值触发set 事件
        let {width,depth,height,mat}=this;
        //铝框
        this.lvKuang=new LvKang(width,depth);
        this.add(this.lvKuang);
        //台面
        this.taiMian=new BoxMesh(width,height,depth);
        this.taiMian.name='taiM';
        this.taiMian.translateY(this.lvKuang.height);
        this.add(this.taiMian);
        this.mat=mat;
    }
}
DiTai.text='地台';
export default DiTai;










