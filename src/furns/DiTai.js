/*
* 分体厅柜-地台
* 形参{}
* w h d
* {
* */
import {BoxBufferGeometry,MeshLambertMaterial,Mesh,Group} from 'three'
import Conf from '../com/Conf'
import BoxMesh  from '../Objects/BoxMesh'
let unit=Conf.unit;
export default class DiTai extends Group{
    constructor(w=.6*unit,h=.03*unit,d=.322*unit,taiMat,lvMat){
        super();
        this.w=w;
        this.h=h;
        this.d=d;
        this.ls=.004*unit;//铝框內缩
        this.taiMat=taiMat; //铝框Mesh
        this.lvMat=lvMat; //铝框Mesh
        this.init();
    }
    init(){
        let {w,h,d,ls}=this;
        //铝框尺寸
        let [lw,lh,ld]=[w-ls*2,.025*unit,d-ls*2];
        let meshLvK=new BoxMesh(lw,lh,ld,this.lvMat);
        meshLvK.name='lvK';
        meshLvK.translateX(ls);
        meshLvK.translateZ(ls);
        this.add(meshLvK);
        //台面
        let meshTaiM=new BoxMesh(w, h,d, this.taiMat);
        meshLvK.name='lvK';
        meshTaiM.translateY(lh);
        this.add(meshTaiM);
    }
}