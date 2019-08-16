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
    constructor(){
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
                value:1200,
                min:400,
                list:[400,600,900,1200,1350,1500,1650,1800],
                set:(val)=>{
                    _this.setW(val);
                }
            }),
            height:sizeParam({
                label:'高度',
                inputType:'selection',
                value:30,
                list:[30,50,100],
                set:(val)=>{
                    _this.setH(val);
                }
            }),
            depth:sizeParam({
                label:'深度',
                value:322,
                min:200,
                list:[322,418,610],
                set:(val)=>{
                    _this.setD(val);
                }
            }),
            mat:matParam({
                value:'huTao',
                label:'台面材质',
                list:['huTao','pingGuo'],
                set:(val)=>{
                    _this.setMat(val);
                }
            })
        })
    }
    //初始化模型
    initMesh(){
        //用get 事件的值触发set 事件
        let {width,height,depth,mat}=this;
        /*---------初始化网格对象---------*/
        //铝框
        this.lvKuang=new LvKang();
        //台面
        this.taiMian=new BoxMesh();
        this.taiMian.y=this.lvKuang.height;
        /*---------设置网格对象的尺寸---------*/
        this.setW(width);
        this.setH(height);
        this.setD(depth);
        /*---------设置网格对象的贴图---------*/
        this.setMat(mat);
        /*---------加载网格对象---------*/
        this.add(this.lvKuang);
        this.add(this.taiMian);
    }
    setW(val){
        this.lvKuang.setLvkW(val);
        this.taiMian.width=val;
    }
    setH(val){
        this.taiMian.height=val;

    }
    setD(val){
        this.lvKuang.setLvkD(val);
        this.taiMian.depth=val;
    }
    setMat(val){
        let _this=this;
        MatTool.parseMat(val,(matParam)=>{
            _this.taiMian.setMaterial(matParam);
            _this.matParsed();
        });
    }
}
DiTai.text='地台';
export default DiTai;










