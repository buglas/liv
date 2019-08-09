/*
* 家具核心类
* */
import {BoxBufferGeometry,MeshLambertMaterial,Mesh,Group} from 'three'
import Conf from '../com/Conf'
import BoxMesh  from '../Objects/BoxMesh'

export default class DiTai extends Group{
    constructor(){
        super();
        this.data=null;
        this.width=600;
        this.height=30;
        this.depth=322;
        this.text='家具名称';
    }
    //监听数据
    walk(){
        let _this=this;
        for(let key in this.data){
            Object.defineProperty(this, key, {
                get: function () {
                    if(_this.data[key].get){
                        //如果数据里存在get 方法，就是用数据里的get 方法
                        return _this.data[key].get();
                    }else{
                        //否则就将数据里的值返回
                        return _this.data[key].value;
                    }

                },
                set: function (val) {
                    _this.data[key].value=val;
                    //调用数据里的set 方法
                    _this.data[key].set(val);
                },
            })
        }
    }
    //材质解析完成事件
    matParsed(){
        this.dispatchEvent({type:'mat-parsed'});
    }

}
