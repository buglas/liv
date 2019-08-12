import {Vector3} from "three";
const Crash={
    suction:100,
    //获取拖拽中的物体位置
    getDragedObjPos:function(transCtrl2,fn){
        //发生碰撞的物体集合
        let box=transCtrl2.dummyBound.box;
        let crashObjs=Crash.getCrashObjs(box,transCtrl2.crashableMeshs,transCtrl2.axis);
        //边界盒子的中心位置，以其为基准,定位物体位置
        let dummyCenter=new Vector3();
        dummyCenter=box.getCenter(dummyCenter);
        //物体的虚拟原始位置，不受吸附影响
        let dummyPos=dummyCenter.sub(transCtrl2.centerSubObj);
        //吸附偏移后的物体位置
        let newObjPos=dummyPos.clone();
        //轴对应的碰撞集合的键
        let map={
            x:['r1l2','l1r2'],
            y:['t1b2','b1t2'],
            z:['f1c2','c1f2'],
        };
        for(let i=0;i<transCtrl2.axis.length;i++){
            let dir=transCtrl2.axis[i];
            let dirA=map[dir][0];
            let dirB=map[dir][1];
            let crashedMesh=Crash.getCrashedMesh(crashObjs[dirA][0],crashObjs[dirB][0]);
            if(crashedMesh){
                fn();
                newObjPos[dir]=dummyPos[dir]+crashedMesh.distance;
            }
        }
        return newObjPos;
    },
    //获取某一个轴的偏移距离，先以对象为形参
    getCrashedMesh:function(o1,o2,key='distance'){
        let obj=null;
        if(o1!=undefined&&o2!=undefined){
            let dis1=(typeof o1==='object')?o1[key]:o1;
            let dis2=(typeof o2==='object')?o2[key]:o2;
            if(Math.abs(dis1)>Math.abs(dis2)){
                obj=o2;
            }else{
                obj=o1;
            }
        }else if(o1!=undefined){
            obj=o1;
        }else if(o2!=undefined){
            obj=o2;
        }
        return obj;
    },
    //获取可碰撞物体集合
    getCrashObjs:function(dragedBox,crashableMeshs,axis){
        //基于边界盒子，做碰撞检测
        let {min,max}=dragedBox;
        //六个面的位置
        let [l1,b1,c1,r1,t1,f1]=[min.x,min.y,min.z,max.x,max.y,max.z];
        //建立碰撞信息对象
        let crashObjs={
            r1l2:[],
            l1r2:[],
            t1b2:[],
            b1t2:[],
            f1c2:[],
            c1f2:[],
        };
        //先判断x 轴
        crashableMeshs.forEach((ele,ind)=>{
            //根据极点获取六个面的位置
            let {l,b,c,r,t,f}=ele;
            let [l2,b2,c2,r2,t2,f2]=[l,b,c,r,t,f];
            //两个边界盒子在三个方向的交叉判断
            //上下
            let bt=t1<t2&&t1>b2 || b1<t2&&b1>b2||t2<t1&&t2>b1;
            //前后
            let cf=f1<f2&&f1>c2 || c1<f2&&c1>c2||f2<f1&&f2>c1;
            //左右
            let lr=l1<r2&&l1>l2 || r1<r2&&r1>l2||l2<r1&&l2>l1;
            //边界盒子六个反normal 面的距离
            let r1l2Dist= l2-r1;
            let l1r2Dist= r2-l1;
            let t1b2Dist= b2-t1;
            let b1t2Dist= t2-b1;
            let f1c2Dist= c2-f1;
            let c1f2Dist= f2-c1;
            //根据拖拽轴限制吸附
            if(axis.includes('x')){
                //r 面
                //数组，可碰撞元素，距离，交叉面a，交叉面b，面，面的位置，吸引力
                Crash.crashObjAdd(crashObjs['r1l2'],ele,r1l2Dist,bt,cf,'r',r2);
                //l 面
                Crash.crashObjAdd(crashObjs['l1r2'],ele,l1r2Dist,bt,cf,'l',l2);
            }
            if(axis.includes('y')){
                //t 面
                Crash.crashObjAdd(crashObjs['t1b2'],ele,t1b2Dist,lr,cf,'t',t2);
                //b 面
                Crash.crashObjAdd(crashObjs['b1t2'],ele,b1t2Dist,lr,cf,'b',b2);
            }
            if(axis.includes('z')){
                //f 面
                Crash.crashObjAdd(crashObjs['f1c2'],ele,f1c2Dist,lr,bt,'f',f2);
                //c 面
                Crash.crashObjAdd(crashObjs['c1f2'],ele,c1f2Dist,lr,bt,'c',c2);
            }
        });
        return crashObjs;
    },
    //往集合中添加可碰撞对象，并由近至远排序
    crashObjAdd:function(r1l2,ele,dist,bt,cf,face,facePos){
        //绝对距离
        let distAbs=Math.abs(dist);
        //符合碰撞条件
        if( (distAbs<Crash.suction)&&bt&&cf){
            //加工碰撞数据
            let obj=Object.assign({
                distance:dist,
                face:face,
                facePos:facePos
            },ele)
            //数组长度
            let len=r1l2.length;
            if(len){
                //数组不为空
                //对比排序
                if(Math.abs(r1l2[len-1].distance)>distAbs){
                    r1l2.unshift(obj);
                }else{
                    r1l2.push(obj);
                }
            }else{
                //数组为空
                //直接置入
                r1l2[0]=obj;
            }
        }
    }
};
export default Crash;
