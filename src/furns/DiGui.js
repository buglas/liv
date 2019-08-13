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
const {livForm,sizeParam,matParam}=FurnData;
class DiGui extends Furn{
    constructor(){
        super();
        //此中已有的参数是为常数，即不会出现在表单中定制
        this.name='DiGui';
        this.text='地柜';
        //台面外扩尺寸
        this.tmo=3;

        this.widthListA=[450,600,900,1200,1350,1500,1800];
        this.widthListB=[450,600,900,1200,1350];
        this.heightListA=[176,352,528,704,880,1056,1408,1760,2112];
        this.heightListB=[176,352,528,704,880];

        //宽度区间，0：w<900，1：900<=w<1350，2：1350<=w
        this.sectionW=[900,1350,1800];
        //高度区间，原理同上
        this.sectionH=[880];
        //会引起变化的节点 sizeState
        this.section={
            width:[900,1350,1800],
            height:[880],
        }

        //尺寸状态，whd 所处的区间
        this.sizeState={
            width:null,
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
                value:450,
                min:450,
                max:1800,
                list:[450,600,900,1200,1350,1500,1800],
                set:(val)=>{
                    _this.setW(val);
                }
            }),
            height:sizeParam({
                label:'高度',
                value:176,
                min:176,
                max:2112,
                list:[176,352,528,704,880,1056,1408,1760,2112],
                set:(val)=>{
                    _this.setH(val);
                }
            }),
            depth:sizeParam({
                label:'深度',
                value:322,
                min:298,
                max:586,
                list:[298,394,586],
                set:(val)=>{
                    _this.setD(val);
                }

            }),
            taiMianH:sizeParam({
                label:'台面高度',
                inputType:'selection',
                value:30,
                list:[30,50,100],
                set:(val)=>{
                    _this.setTaiMianH(val);
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
        })
        //根据宽高默认值，设置尺寸状态数据sizeState
        this.initSizeState();
    }
    //根据宽高默认值，设置尺寸状态数据sizeState
    initSizeState(){
        this.setSizeState('width',this.data.width.value);
        this.setSizeState('height',this.data.height.value);
    }
    setSizeState(key,val){
        this.sizeState[key]=this.getSectPos(this.section[key],val);
    }

    //初始化模型
    initMesh(){
        //建模属性自下至上
        //用get 事件的值触发set 事件
        let {width,depth,height,taiMianH,mat}=this;


        /*---------初始化网格对象---------*/
        //铝框
        this.lvKuang=new LvKang();
        //铝框高度
        let lkH=this.lvKuang.height;
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
        //台面
        this.taiMian=new BoxMesh();

        /*---------恒定尺寸---------*/
        this.diBan.height=thick;
        this.dingBan.height=thick;
        this.beiBan.depth=thick;
        this.ceBanL.width=thick;
        this.ceBanR.width=thick;
        this.zhShuBan1.width=thick;
        this.zhShuBan2.width=thick;

        /*---------恒定位置---------*/
        this.taiMian.y=lkH;
        this.ceBanL.y=lkH;
        this.ceBanR.y=lkH;
        this.zhShuBan1.y=lkH+thick;
        this.zhShuBan2.y=lkH+thick;
        this.diBan.y=lkH;
        this.beiBan.y=lkH+thick;

        this.diBan.x=thick;
        this.dingBan.x=thick;
        this.beiBan.x=thick;
        this.taiMian.x=-this.tmo;
        this.zhShuBan1.z=thick;
        this.zhShuBan2.z=thick;


        /*---------设置网格对象的尺寸---------*/
        this.setW(width);
        this.setH(height);
        this.setD(depth);
        this.setTaiMianH(taiMianH);

        /*---------设置网格对象的贴图---------*/
        this.setMat(mat);
        /*---------加载网格对象---------*/
        this.add(this.lvKuang);
        this.add(this.diBan);
        this.add(this.beiBan);
        this.add(this.ceBanL);
        this.add(this.ceBanR);
        this.add(this.zhShuBan1);
        this.add(this.zhShuBan2);
        this.add(this.dingBan);
        this.add(this.taiMian);
    }
    //柜体尺寸
    setW(val){
        this.setSizeState('width',val);
        //部件尺寸
        this.lvKuang.setLvkW(val);
        this.diBan.width=val-thick*2;
        this.dingBan.width=val-thick*2;
        this.beiBan.width=val-thick*2;
        this.taiMian.width=val+this.tmo*2;
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
                this.zhShuBan1.x=(val-thick)/2
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
        /*if(st<2){
            this.data.height.list=this.heightListA;
            this.data.height.max=Math.max(...this.heightListA);
        }else{
            this.data.height.list=this.heightListB;
            this.data.height.max=Math.max(...this.heightListB);
        }*/
    }
    setH(val){
        this.setSizeState('height',val);
        let lkH=this.lvKuang.height;
        this.beiBan.height=val-thick*2;
        this.ceBanL.height=val;
        this.ceBanR.height=val;
        this.zhShuBan1.height=val-thick*2;
        this.zhShuBan2.height=val-thick*2;

        this.dingBan.y=val-thick+lkH;
        this.taiMian.y=val+lkH;
        let st=this.sizeState.height;
        /*if(st>0){
            this.data.width.list=this.widthListB;
            this.data.width.max=Math.max(...this.heightListB);
        }else{
            this.data.width.list=this.widthListA;
            this.data.width.max=Math.max(...this.heightListA);
        }*/
    }
    setD(val){
        this.lvKuang.setLvkD(val);
        this.diBan.depth=val;
        this.dingBan.depth=val;
        this.ceBanL.depth=val;
        this.ceBanR.depth=val;
        this.zhShuBan1.depth=val-thick;
        this.zhShuBan2.depth=val-thick;
        this.taiMian.depth=val+thick;
    }
    //台面高度
    setTaiMianH(val){
        this.taiMian.height=val;
    }
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
            _this.taiMian.setMaterial(matParam);
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

    //获取尺寸所处的区间位置
    getSectPos(ps,val){
        let n=0;
        let len=ps.length;
        console.log('---',ps);
        for (let i=0;i<len;i++){
            if(i===0&&val<ps[i]){
                break;
            }else if(i===len-1){
                n=i;
                break;
            }else if(val>=ps[i]&&val<ps[i+1]){
                console.log('wwwwwwwwwwwww');
                n=i+1;
                break;
            }
        }
        return n;
    }
}
DiGui.text='地柜';
export default DiGui;










