/**
 * @author yangqi
 * @email txzm2018@gmail.com
 * @create date 2018-07-13 12:21:22
 * @modify date 2018-07-13 12:21:22
 * @desc [description]
*/
cc.Class({
    extends: cc.Component,

    properties: {
        itemPrefab: {
            type: cc.Prefab,
            default: null
        },
        itemScriptName: '',
        itemScriptFuncName: '',
        spacingY: 0,
        mask: cc.Node
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    start () {

    },

    update (dt) {
        // 判断上滑还是下滑
        const y = this.node.y;
        if(y === this._lastY || this.node.height <= this.mask.height){
            return;
        }
        // 是否下滑
        const isDown = y > this._lastY;
        this._lastY = y;
        // 遍历所有的item如果有超出缓冲区则循环到另一侧缓冲区
        // 有可初始化的数据则重新初始化节点，如果没有可初始化的数据则隐藏节点
        if(isDown){
            let item = this._items[0];
            while(this._outOfBuffTop(item)){
                this._items.shift();
                this._items.push(item);
                item = this._items[0];
            }
        }else{
            let item = this._items[this.count - 1];
            while (this._outOfBuffTop(item)) {
                this._items.pop();
                this._items.unshift(item);
                item = this._items[this.count - 1];
            }
        }
    },

    init (infos){
        this._items = [];
        this.count = infos.length;
        if(this.count < 1){
            // 没有要显示的节点
            this.node.setContentSize(cc.size(0, 0));
            return;
        }
        this.infos = infos;
        const item = cc.instantiate(this.itemPrefab);
        item.parent = this.node;
        const height = (item.height + this.spacingY) * this.count - this.spacingY;
        const width = item.width;
        this.node.setContentSize(cc.size(width, height));
        this.node.setAnchorPoint(cc.v2(0.5, 1));
        this.node.x = 0;
        this.node.y = this.mask.height / 2;
        // 初始化第一个节点
        this._initItem(item, 0);
        this._items.push(item);

        this._lastY = this.node.y;
        this._topIndex = 0;
        this._itemWidth = item.width;
        this._itemHeight = item.height;
        this._visibleSize = this.mask.getContentSize();
        this._buffSize = cc.size(this._visibleSize.width, this._visibleSize.height * 2);
        this._itemCount = Math.floor(this._buffSize.height / (this._itemHeight +  this.spacingY)) + 1
        // 初始化节点
        for(let i = 1; i < this._itemCount; i++){
            const item = cc.instantiate(this.itemPrefab);
            item.parent = this.node;
            this._initItem(item, i);
            this._items.push(item);
        }
    },

    _getItemPosByIndex(index){
        const y = index * (this.itemHeight + this.spacingY);
        const x = 0;
        return cc.v2(x, y);
    },

    _initItem(item, index){
        // index为负则无信息
        const info = index >= 0 && this.infos[index];
        item.setAnchorPoint(cc.v2(0.5, 1));
        item.setPosition(this._getItemPosByIndex(index));
        if(info){
            item.active = true;
            const script = item.getComponent(this.itemScriptName);
            script[this.itemScriptFuncName](info);
        }else{
            item.active = false;
        }
    },

    _moveToBottom(item){
        this._initItem(item, this._topIndex + this._itemCount);
        this._topIndex++;
    },

    _moveToTop(item){
        this._initItem(item, this._topIndex - 1);
        this._topIndex--;
    },

    _outOfBuffTop(item){
        const wpos = this.node.convertToWorldSpaceAR(cc.v2(item.x, item.y - item.height));
        const mpos = this.mask.convertToNodeSpaceAR(wpos);
        return mpos.y > this.mask.height;
    },

    _outOfBuffBottom(item){
        const wpos = this.node.convertToWorldSpaceAR(item.getPosition());
        const mpos = this.mask.convertToNodeSpaceAR(wpos);
        return mpos.y < -this.mask.height;
    }
});
