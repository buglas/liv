export default class Observer{
    constructor(data){
        this.data = data;
        this.walk(data);
    }
    walk(data){
        let self = this;
        Object.keys(data).forEach(function (key) {
            self.defineReactive(data, key, data[key]);
        });
    }
    defineReactive(data, key, val) {
        //一个observer 对应一个Dep
        let dep = new Dep();
        //这会递归一次
        //Object 类型的值，返回Observer 类型的对象，其data 会被监听
        //非Object 类型，啥也不返回
        let childObj = this.observe(val);
        //监听data 的属性变化
        Object.defineProperty(data, key, {
            //可枚举
            enumerable: true,
            configurable: true,
            get: function getter () {
                if (Dep.target) {
                    dep.addSub(Dep.target);
                }
                return val;
            },
            set: function setter (newVal) {
                //差异对比
                if (newVal === val) {
                    return;
                }
                val = newVal;
                //使dep 子元素更新。子元素是什么鬼，更新是何意？
                //遍历子元素，使其更新
                dep.notify();
            },
        });
    }
    observe(value){
        if (!value || typeof value !== 'object') {
            return;
        }
        return new Observer(value);
    }
}