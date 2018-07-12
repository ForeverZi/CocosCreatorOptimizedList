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
        const infos = [];
        for(let i = 0; i < 100; i++){
            infos.push(i);
        }
        const script = this.content.getComponent('OptimizeList');
        script.init(infos);
    },

    start () {

    },

    // update (dt) {},
});
