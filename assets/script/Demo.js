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

    onLoad () {
       this.infos = [];
        for(let i = 0; i < 20; i++){
            this.infos.push(i);
        }
        this.id = 20;
        const script = this.content.getComponent('OptimizeList');
        script.refresh(this.infos, (info)=>{
            return info===1;
        });
    },

    onClickAdd () {
        this.infos.push(this.id);
        console.log('onclick add:', this.id);
        this.id++;
        const script = this.content.getComponent('OptimizeList');
        script.refresh(this.infos);
    },

    onClickSub(){
        const length = this.infos.length;
        const rd = Math.floor(Math.random() * length);
        console.log('onclick sub:', this.infos[rd]);
        const infos = this.infos.filter((e, index)=> index !== rd);
        this.infos = infos;
        const script = this.content.getComponent('OptimizeList');
        script.refresh(infos);
    }
});
