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

    statics: {
        SELECT_ITEM_EVENT: 'SELECT_ITEM_EVENT'
    },

    onLoad () {
        this.node.on('SELECT_ITEM_EVENT', (event)=>{
            if(typeof event.detail === 'function'){
                this.setSelectFilter(event.detail);
            }else{
                console.warn('SELECT_ITEM_EVENT 事件的detail没有设置为选择器函数');
            }
        });
    },

    update (dt) {
        // 判断上滑还是下滑
        const y = this.node.y;
        if(y === this._lastY || this.node.height <= this.mask.height || !this._initedFlag){
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

    // 用于切换列表数据时适应位置
    _adjust() {
        let item = this._rowItems[0];
        while (item && this._outOfVisibleTop(item)) {
            this._moveToBottom(item);
            this._rowItems.shift();
            this._rowItems.push(item);
            item = this._rowItems[0];
        }
        item = this._rowItems[this.rowItemCount - 1];
        while (item && this._outOfVisibleBottom(item)) {
            this._moveToTop(item);
            this._rowItems.pop();
            this._rowItems.unshift(item);
            item = this._rowItems[this.rowItemCount - 1];
        }
    },

    refresh (infos, filter){
        this._selectInfo = null;
        if(typeof filter === 'function'){
            this._selectFilter = filter;
        }
        if (!this._initedFlag) {
            this._init(infos);
            return;
        }
        this.infos = infos;
        this.itemCount = this.infos.length;
        // 修改content的高度
        const height = (this._itemHeight + this.spacingY) * Math.ceil(infos.length / this.column) - this.spacingY;
        const osize = this.node.getContentSize();
        this.node.setContentSize(cc.size(osize.width, height));
        if(infos.length < this.itemCount){
            this._onRowCountReduced(infos);
        }
        this._adjust();
        // 刷新所有缓存的rowItem
        let i = 0;
        for (const rowItem of this._rowItems) {
            this._initRowItem(rowItem, this._topIndex + i);
            i++;
        }
    },

    getSelectInfo(){
        return this._selectInfo;
    },

    setSelectFilter(filter){
        //Boolean filter(info)判定是否是被选中
        this._selectFilter = filter;
        this.refresh(this.infos, filter);
    },

    _onRowCountReduced(infos) {
        // 调节位置
        let item = this._rowItems[this.rowItemCount - 1];
        while (item && (this._outOfVisibleBottom(item) || ((this.rowItemCount + this._topIndex - 1)*this.column >= infos.length))) {
            this._moveToTop(item);
            this._rowItems.pop();
            this._rowItems.unshift(item);
            item = this._rowItems[this.rowItemCount - 1];
        }
    },

    // 不建议直接调用这个，可以直接调用refresh方法
    _init (infos){
        this.infos = infos;
        this.itemCount = this.infos.length;
        this._rowItems = [];
        if (this.itemCount < 1){
            // 没有要显示的节点
            this.node.setContentSize(cc.size(0, 0));
            return;
        }
        this._initedFlag = true;
        const rowItem = this._addRowItem();
        const height = (rowItem.height + this.spacingY) * Math.ceil(infos.length / this.column) - this.spacingY;
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
            if(typeof this._selectFilter === 'function' &&
                typeof script.select === 'function' && 
                typeof script.unselect === 'function'){
                const selected = this._selectFilter(info);
                if(selected){
                    script.select();
                    this._selectInfo = info;
                }else{
                    script.unselect();
                }
            }
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
