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
        column: 1,
        spacingY: 0,
        spacingX: 0,
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
        // 是否上滑
        const isUp = y > this._lastY;
        this._lastY = y;
        // 遍历所有的item如果有超出缓冲区则循环到另一侧缓冲区
        // 有可初始化的数据则重新初始化节点，如果没有可初始化的数据则隐藏节点
        if(isUp){
            let item = this._rowItems[0];
            while(item && this._outOfVisibleTop(item)){
                this._moveToBottom(item);
                this._rowItems.shift();
                this._rowItems.push(item);
                item = this._rowItems[0];
            }
        }else{
            let item = this._rowItems[this.rowItemCount - 1];
            while (item && this._outOfVisibleBottom(item)) {
                this._moveToTop(item);
                this._rowItems.pop();
                this._rowItems.unshift(item);
                item = this._rowItems[this.rowItemCount - 1];
            }
        }
    },

    init (infos){
        this.infos = infos;
        this._rowItems = [];
        this.count = infos.length;
        if(this.count < 1){
            // 没有要显示的节点
            this.node.setContentSize(cc.size(0, 0));
            return;
        }
        const rowItem = this._addRowItem();
        const height = (rowItem.height + this.spacingY) * Math.ceil(this.count / this.column) - this.spacingY;
        const width = rowItem.width;
        this.node.setContentSize(cc.size(width, height));
        this.node.setAnchorPoint(cc.v2(0.5, 1));
        this.node.x = 0;
        this.node.y = this.mask.height / 2;
        // 初始化第一个节点
        this._initRowItem(rowItem, 0);
        this._rowItems.push(rowItem);
        this._lastY = this.node.y;
        this._topIndex = 0;
        this._visibleSize = this.mask.getContentSize();
        this.rowItemCount = Math.ceil(this._visibleSize.height / (this._itemHeight +  this.spacingY)) + 2;
        // 初始化节点
        for(let i = 1; i < this.rowItemCount; i++){
            const rowItem = this._addRowItem();
            this._initRowItem(rowItem, i);
            this._rowItems.push(rowItem);
        }
        console.log('column:', this.column);
        console.log(`一共创建了${this.rowItemCount * this.column}个Item实例`);
    },

    _getRowItemPosByRow(index){
        const y = -index * (this._itemHeight + this.spacingY);
        const x = 0;
        return cc.v2(x, y);
    },

    _getItemPosByColumn(index){
        const y = - this._itemHeight / 2;
        const isEven = (this.column % 2 === 0);
        let x;
        if(!isEven){
            const rightIndex = this.column / 2;
            x = (index - rightIndex + 0.5) * (this._itemWidth + this.spacingX)
        }else{
            const midIndex = (this.column - 1) / 2;
            x = (index - midIndex) * (this._itemWidth + this.spacingX);
        }
        return cc.v2(x, y);
    },

    _addRowItem(){
        // prefab需要锚点在cc.v2(0.5, 1), 否则其子节点位置可能会出现问题
        const item = cc.instantiate(this.itemPrefab);
        item.name = '_sub0';
        this._itemWidth = item.width;
        this._itemHeight = item.height;
        const rowItem = new cc.Node('container');
        rowItem.setContentSize(cc.size((item.width + this.spacingX) * this.column - this.spacingX , item.height));
        rowItem.setAnchorPoint(cc.v2(0.5, 1));
        rowItem.parent = this.node;
        item.parent = rowItem;
        item.setPosition(this._getItemPosByColumn(0));
        for(let i = 1; i < this.column; i++){
            const item = cc.instantiate(this.itemPrefab);
            item.name = '_sub' + i;
            item.parent = rowItem;
            item.setPosition(this._getItemPosByColumn(i));
        }
        return rowItem;
    },

    _initItem(item, index){
        // index为负则无信息
        if (index >= 0 && index < this.infos.length) {
            const info = this.infos[index];
            item.active = true;
            const script = item.getComponent(this.itemScriptName);
            script[this.itemScriptFuncName](info);
        } else {
            item.active = false;
        }
    },

    _initRowItem(rowItem, rowIndex){
        let isVisible = false;
        rowItem.setPosition(this._getRowItemPosByRow(rowIndex));
        for(let i = 0; i < this.column; i++){
            const item = rowItem.getChildByName('_sub' + i);
            const index = rowIndex * this.column + i;
            this._initItem(item, index);
            if(index >=0 && index < this.infos.length){
                isVisible = true;
            }
        }
        rowItem.active = isVisible;
    },

    _moveToBottom(rowItem){
        this._initRowItem(rowItem, this._topIndex + this.rowItemCount);
        this._topIndex++;
    },

    _moveToTop(rowItem){
        this._initRowItem(rowItem, this._topIndex - 1);
        this._topIndex--;
    },

    _outOfVisibleTop(rowItem){
        const wpos = this.node.convertToWorldSpaceAR(cc.v2(rowItem.x, rowItem.y - rowItem.height));
        const mpos = this.mask.convertToNodeSpaceAR(wpos);
        return mpos.y > this.mask.height / 2;
    },

    _outOfVisibleBottom(rowItem){
        const wpos = this.node.convertToWorldSpaceAR(rowItem.getPosition());
        const mpos = this.mask.convertToNodeSpaceAR(wpos);
        return mpos.y < -this.mask.height / 2;
    }
});
