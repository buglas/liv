/*
* 分体厅柜-地台
* 形参{}
* w h d
* {
* */
import BoxMesh  from '../Objects/BoxMesh'
import Conf from '@/com/Conf'
import MatTool from "@/com/MatTool";
import Tool from "@/com/Tool";
import FurnData from '@/com/FurnData'
import Furn from '@/core/Furn'
import LvKang from '@/parts/LvKuang'
let {thick}=Conf;
//模型数据关联表单数据
const {livForm,sizeParam,matParam,parseList}=FurnData;
class DiaoGui extends Furn{
    constructor(){
        super();
        //此中已有的参数是为常数，即不会出现在表单中定制
        this.name='DiaoGui';
        this.text='吊柜';
        //会变化的尺寸列表
        this.widthListA=[450,600,900,1200,1350,1500,1800];
        this.widthListB=[450,600,900,1200,1350];
        this.heightListA=[352,528,704,880,1056,1408];
        this.heightListB=[352,528,704,880];
        //会引起变化的节点 sizeState
        this.section={
            width:[900,1350,1800],
            height:[880],
        };
        //尺寸状态，whd 所处的区间
        this.sizeState={
            //宽度区间，0：w<900，1：900<=w<1350，2：1350<=w
            width:null,
            //同上
            height:null
        };
        //初始化
        this.init();
    }
    //初始化data 数据
    initData(){
        let _this=this;
        this.data=livForm(this,{
            width:sizeParam({
                label:'宽度',
                value:900,
                min:450,
                max:1800,
                list:_this.widthListA,
                set:(val)=>{
                    _this.setW(val);
                }
            }),
            height:sizeParam({
                label:'高度',
                value:352,
                min:176,
                max:2112,
                list:_this.heightListA,
                set:(val)=>{
                    _this.setH(val);
                }
            }),
            depth:sizeParam({
                label:'深度',
                value:298,
                min:298,
                max:586,
                list:[298,394,586],
                set:(val)=>{
                    _this.setD(val);
                }

            }),
            mat:matParam({
                value:'huTao',
                label:'地柜材质',
                list:['huTao','pingGuo'],
                set:(val)=>{
                    _this.setMat(val);
                }
            })
        });
        //根据宽高默认值，设置尺寸状态数据sizeState
        this.initSizeState();
    }

    //设置初始化模型
    initMesh(){
        //建模属性自下至上
        //用get 事件的值触发set 事件
        let {width,depth,height,mat}=this;

        /*---------初始化网格对象---------*/
        //铝框高度
        //底板
        this.diBan=new BoxMesh();
        //背板
        this.beiBan=new BoxMesh();
        //左侧板
        this.ceBanL=new BoxMesh();
        //右侧板
        this.ceBanR=new BoxMesh();
        //中竖版1
        this.zhShuBan1=new BoxMesh();
        //中竖版2
        this.zhShuBan2=new BoxMesh();
        //顶板
        this.dingBan=new BoxMesh();

        /*---------恒定尺寸---------*/
        this.diBan.height=thick;
        this.dingBan.height=thick;
        this.beiBan.depth=thick;
        this.ceBanL.width=thick;
        this.ceBanR.width=thick;
        this.zhShuBan1.width=thick;
        this.zhShuBan2.width=thick;

        /*---------恒定位置---------*/
        this.zhShuBan1.y=thick;
        this.zhShuBan2.y=thick;
        this.beiBan.y=thick;

        this.diBan.x=thick;
        this.dingBan.x=thick;
        this.beiBan.x=thick;
        this.zhShuBan1.z=thick;
        this.zhShuBan2.z=thick;


        /*---------设置网格对象的尺寸---------*/
        this.setW(width);
        this.setH(height);
        this.setD(depth);

        /*---------设置网格对象的贴图---------*/
        this.setMat(mat);
        /*---------加载网格对象---------*/
        this.add(this.diBan);
        this.add(this.beiBan);
        this.add(this.ceBanL);
        this.add(this.ceBanR);
        this.add(this.zhShuBan1);
        this.add(this.zhShuBan2);
        this.add(this.dingBan);
    }
    //柜体尺寸
    setW(val){
        this.setSizeState('width',val);
        //部件尺寸
        this.diBan.width=val-thick*2;
        this.dingBan.width=val-thick*2;
        this.beiBan.width=val-thick*2;
        //部件位置

        this.ceBanR.x=val-thick;

        //中竖板位置与显示
        let st=this.sizeState.width;
        console.log('st',st);
        switch (st){
            case 0:
                this.zhShuBan1.visible=false;
                this.zhShuBan2.visible=false;
                break;
            case 1:
                this.zhShuBan1.visible=true;
                this.zhShuBan2.visible=false;
                this.zhShuBan1.x=(val-thick)/2;
                break;
            case 2:
                this.zhShuBan1.visible=true;
                this.zhShuBan2.visible=true;
                this.zhShuBan1.x=450-thick;
                this.zhShuBan2.x=val-450;
                break;
            case 3:
                this.zhShuBan1.visible=true;
                this.zhShuBan2.visible=true;
                this.zhShuBan1.x=600-thick;
                this.zhShuBan2.x=val-600;
                break;
        }
        //宽度会影响高度数据
        if(st<2){
            this.setList('height',this.heightListA);
            this.setMax('height',Math.max(...this.heightListA));
        }else{
            this.setList('height',this.heightListB);
            this.setMax('height',Math.max(...this.heightListB));
        }
    }
    setH(val){
        this.setSizeState('height',val);
        this.beiBan.height=val-thick*2;
        this.ceBanL.height=val;
        this.ceBanR.height=val;
        this.zhShuBan1.height=val-thick*2;
        this.zhShuBan2.height=val-thick*2;

        this.dingBan.y=val-thick;
        let st=this.sizeState.height;

        if(st>0){
            this.setList('width',this.widthListB);
            this.setMax('width',Math.max(...this.widthListB));
        }else{
            this.setList('width',this.widthListA);
            this.setMax('width',Math.max(...this.widthListA));
        }
    }
    setD(val){
        this.diBan.depth=val;
        this.dingBan.depth=val;
        this.ceBanL.depth=val;
        this.ceBanR.depth=val;
        this.zhShuBan1.depth=val-thick;
        this.zhShuBan2.depth=val-thick;
    }
    //设置材质
    setMat(val){
        let _this=this;
        MatTool.parseMat(val,(matParam)=>{
            _this.diBan.setMaterial(matParam);
            _this.beiBan.setMaterial(matParam);
            _this.ceBanL.setMaterial(matParam);
            _this.ceBanR.setMaterial(matParam);
            _this.zhShuBan1.setMaterial(matParam);
            _this.zhShuBan2.setMaterial(matParam);
            _this.dingBan.setMaterial(matParam);
            _this.matParsed();
        });
    }
    //获取柜内尺寸
    getInsertW(width){
        return width-2*thick;
    }
    getInsertH(height){
        return height-2*thick;
    }
}
DiaoGui.text='吊柜';
export default DiaoGui;










