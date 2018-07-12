/**
 * @author yangqi
 * @email txzm2018@gmail.com
 * @create date 2018-07-13 01:36:54
 * @modify date 2018-07-13 01:36:54
 * @desc [description]
*/
cc.Class({
    extends: cc.Component,

    properties: {
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    init(num){
       this.node.getChildByName('num').getComponent(cc.Label).string = num;
    }
});
