export default class Dep {
    constructor(){
        this.subs = [];
    }
    //添加子元素，sub 是Dep.target
    addSub(sub) {
        this.subs.push(sub);
    }
    notify(){
        //Dep.target被指定了，才能通过get 被添加到subs 里，subs 才能有的遍历
        //遍历子元素，使其更新
        this.subs.forEach(function (sub) {
            sub.update();
        });
    }
}