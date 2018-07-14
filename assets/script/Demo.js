/**
 * @author yangqi
 * @email txzm2018@gmail.com
 * @create date 2018-07-13 01:38:18
 * @modify date 2018-07-13 01:38:18
 * @desc [description]
*/

cc.Class({
    extends: cc.Component,

    properties: {
        content: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
       this.infos = [];
        for(let i = 0; i < 20; i++){
            this.infos.push(i);
        }
        const script = this.content.getComponent('OptimizeList');
        script.init(this.infos);
    },

    start () {

    },

    // update (dt) {},

    onClickAdd () {
        this.infos.push(this.infos.length);
        const script = this.content.getComponent('OptimizeList');
        console.log('onclick add:', this.infos.length);
        script.refresh(this.infos);
    },

    onClickSub(){
        const length = this.infos.length;
        const rd = Math.floor(Math.random() * length);
        const infos = this.infos.filter((e, index)=> index !== rd);
        this.infos = infos;
        const script = this.content.getComponent('OptimizeList');
        console.log('onclick sub:', infos.length);
        script.refresh(infos);
    }
});
