/**
 * Created by f on 2015/4/8.
 */
function FilterGoods(obj){
    this.putGoodsDiv = obj.putGoodsDiv;  //列表容器
    this.filerDiv = obj.filerDiv;    //过滤容器
    this.pagination = obj.pagination || null;  //页码容器
    this.pageNum = obj.pageNum;   //显示条数
    this.pageRange = obj.pageRange || 12;    //显示页码范围，默认12页， 超过压缩页码
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
    //************ ajax加载 ********************
    loadAjax: function(page){
        var that = this,
            conf = that.conf,
            pageNum = that.pageNum,
            pageTotality;     //总数

        $.ajax({
            type: 'post',
            dataType: 'json',
            url: 'static/js/test.json',
            data: {id: conf.sID, name: conf.name},
            success: function(json){
                if(typeof  json === 'object'){
                    that.addList(json,pageNum);
                    if(that.pagination !== null){
                        pageTotality = +json.totality;   //将列表总数 string 换位 int
                        that.addPagination(page, pageTotality);
                    }
                }
            }
        });
    },
    //************* 添加列表 *********************
    addList: function(list,num){
        var $putGoodsDiv = $(this.putGoodsDiv),
            aDom = [],
            goods = list.goods,
            i, good;

        $('#hot,#new').remove();

        for(i = 0; i < num; i++){
            good = goods[i];
            aDom.push([
                '<li>',
                    '<a class="wrap" href="', good.ID , '">',
                        '<div class="wrap-img">',
                            '<img src="', good.picture ,'">',
                        '</div>',
                        '<div class="inner">',
                            '<p><strong>', good.title ,'</strong></p>',
                            '<p><strong>', good.price ,'</strong></p>',
                            '<p>', good.company ,'</p>',
                        '</div>',
                   '</a>',
                '</li>'
            ].join(''));
        }
        $putGoodsDiv.html(aDom.join(''));
    },
    //*************** 添加页码 ********************
    addPagination: function(page, pageTotality){
        var $pagination = this.pagination,
            pageSize = Math.ceil(pageTotality / this.pageNum),
            aDom = [],
            addDom = function(number, count, index){
                var dom ='';
                for(var i = number; i <= count; i++){
                    if(i != index){
                        dom += '<a class="go-page" href="javascript:;">' + i + '</a>';
                    }
                    else{
                        dom += '<span class="active">' + i + '</span>';
                    }
                }
                return dom;
            };

        aDom.push('<div class="pagination"><a class="pre" href="javascript:;">上一页</a>');
        if(pageSize <= this.pageRange){
            aDom.push(addDom(1, pageSize, page));
        } else{           //超过设定的页码范围，压缩页码在
            if(page <= 7){                 //后面加 "..."
                aDom.push(addDom(1,11,page));
                aDom.push('<span>...</span><a class="go-page" href="javascript:;">' + pageSize + '</a>');
            } else if(pageSize - page < 5){          //前面加 "..."
                aDom.push('<a class="go-page" href="javascript:;">1</a><span>...</span>');
                aDom.push(addDom(pageSize - 10,pageSize,page));
            } else{
                aDom.push('<a class="go-page" href="javascript:;">1</a><span>...</span>');
                aDom.push(addDom(page -5,Number(page) + 3,page));
                aDom.push('<span>...</span><a class="go-page" href="javascript:;">' + pageSize + '</a>');
            }
        }
        aDom.push('<a class="next" href="javascript:;">下一页</a></div>')
        $pagination.html(aDom.join(''));
    },
    //************* 添加过滤条件 ***************
    addClassify: function(obj){
        var $filerDiv = this.filerDiv,
            $items = filerDiv.children(),
            sDom = [                    //添加的DOM
                '<a data-id="', obj.dataId , '" href="javascript:;">',
                '<label>', obj.classify ,'：</label>',
                '<span>', obj.text ,'</span>',
                '<span class="del" title="删除">x</span>',
                '</a>'
            ].join(''),
            flag = true,
            sCal;   //存放过滤的条件， 如 分类 品牌

        $items.each(function(){
            //判断 item 是否存在
            if($(this)){
                sCal = $items.find('label').text().slice(0,2);
                if(sCal === obj.classify){
                    //替换掉筛选的条件
                    $(sDom).replaceAll(this);
                    flag = false;      //用来判断 是替换 还是 添加
                }
            }
        });
        //添加 过滤条件
        if(flag){
            $filerDiv.append(sDom);
        }
        $filerDiv.children().each(function(){

        });
    }
};