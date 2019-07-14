//有点麻烦，先使用vue 试试，正好很久没有vue 了
//可以模仿此结构
//表单的显示条件v-if：curFurn 实际家具对象是否存在
//表单的建立要for循环家具的key
//家具位置的判断条件v-show：家具creating 是否false
let mode=`
    <div id="app">
        <h2>{{title}}</h2>
        <input v-model="name">
        <h1>{{name}}</h1>
        <button v-on:click="clickMe">click me!</button>
    </div>
`

new Liv({
    //可以是表单包裹器
    el: '#app',
    data: {
        title: 'vue code',
        name: 'imooc',
    },
    methods: {
        clickMe: function (){
            this.title = 'vue code click';
        },
    },
    mounted: function () {
        window.setTimeout(() => {
            this.title = 'timeout 1000';
        }, 2000);
    },
});