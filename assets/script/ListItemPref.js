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
        selectPanel: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    init(num){
        this.info = num;
        this.node.getChildByName('num').getComponent(cc.Label).string = num;
    },

    select(){
        this.selectPanel.active = true;
    },

    unselect(){
        this.selectPanel.active = false;
    },

    onClick(){
        // select
        const event = new cc.Event.EventCustom('SELECT_ITEM_EVENT', true);
        event.detail = (info)=>this.info===info;
        this.node.dispatchEvent(event);
    }
});
