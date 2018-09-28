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
        const event = new cc.Event.EventCustom('SELECT_ITEM_EVENT', true);
        // 注意这里不应该使用this.info和info比较,而是需要将this.info赋值为一个闭包变量,this.info会因为list的刷新而改变
        const cinfo = this.info;
        event.detail = (info)=>cinfo===info;
        this.node.dispatchEvent(event);
    }
});
