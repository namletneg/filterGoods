/**
 * Created by f on 2015/4/8.
 */
function FilterGoods(obj){
    this.putGoodsDiv = obj.putGoodsDiv;
    this.filerDiv = obj.filerDiv;
    this.pagination = obj.pagination;
}
FilterGoods.prototype = {
    constructor: FilterGoods,
    conf: {
        sID : '',
        sName : ''
    },
    //*************** 获取  id，name 的值 ***********************
    getData: function(options){
        var conf = this.conf;

        conf.sID = '';
        conf.sName = '';
        if(typeof options === 'object'){
            options.each(function(){
                if($(this).data('id')){
                    conf.sID = $(this).data('id');
                } else if($(this).data('name')){
                    conf.sName = $(this).data('name');
                }
            });
        }
    },
    //************* 添加过滤条件 ***************
    addClassify: function(){

    }
};