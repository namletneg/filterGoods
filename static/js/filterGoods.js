/**
 * Created by f on 2015/4/8.
 */
function FilterGoods(obj){
    this.putGoodsDiv = obj.putGoodsDiv;  //列表容器
    this.filerDiv = obj.filerDiv;    //过滤容器
    this.pagination = obj.pagination || null;  //页码容器
    this.pageNum = obj.pageNum;   //显示条数
    this.pageRange = obj.pageRange || 12;    //显示页码范围，默认12页， 超过压缩页码

    this.init();
}
FilterGoods.prototype = {
    constructor: FilterGoods,
    conf: {
        Action: 'product'
    },
    init: function(){
        var that = this;

        $('.classify').on('click','ul li a', function(){
            var $filerDiv = $(that.filerDiv),
                $filerItems = $filerDiv.children(),
                obj = {};

            obj.dataId = this.id;
            obj.classifiy = $(this).data('classify');
            obj.classifyText = $(this).parents('dl').find('dt').text().slice(0,2);
            obj.text = $(this).text();

            $(this).toggleClass('active').parent().siblings().find('a').removeClass('active'); //增删 a 的样式
            //判断是增加过滤条件还是删除过滤条件
            if(this.className){
                //添加
                that.addClassify(obj);
            } else{
                //删除
                $filerItems.each(function(index){
                    if($($filerItems[index]).data('classify') === obj.classifiy){    //判断是否同一过滤条件
                        $($filerItems[index]).remove();
                        delete that.conf[obj.classifiy];   //去掉参数的值
                    }
                });
                if($filerItems.length === 1){
                    $filerDiv.hide();
                }
            }
            that.loadAjax(1)
        });
        $(that.filerDiv).on('click','a .del', function(){
            var $aElement = $(this).parent(),
                $filerDiv = $(that.filerDiv);

            $aElement.remove();
            delete that.conf[$aElement.data('classify')];     //去掉参数的值
            if($filerDiv.children().length === 0){
                $filerDiv.hide();
            }
            that.loadAjax(1);
        });

        //**绑定页码的 click 事件
        //如果页码存在
        if(that.pagination){
            $(that.pagination).on('click', 'a', function(){
                var iPage;
                switch (this.className){
                    case 'go-page':
                        iPage = +($(this).text());   //将页数转换为 int
                        break;
                    case 'pre':
                        iPage = +($(that.pagination).find('span.active').text()) - 1;   //上一页
                        break;
                    case 'next':
                        iPage = +($(that.pagination).find('span.active').text()) + 1;   //下一页
                }
                that.loadAjax(iPage);
                $(window).scrollTop(0);
            });
        }
    },
    //*************** 获取传送参数 ***********************
    getData: function(options){
        var conf = this.conf;

        if(typeof options === 'object'){
            options.each(function(){
                conf[$(this).data('classify')] = $(this).data('value');   //把参数添加到 conf 对象
            });
        }
    },
    //************ ajax加载 ********************
    loadAjax: function(page){
        var that = this,
            $filerDiv = $(that.filerDiv),
            conf = that.conf,
            pageNum = that.pageNum,
            pageTotality;     //总数

        that.getData($filerDiv.children());  //获取传送参数
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: 'static/js/test.json',
            data: conf,
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
        var that = this,
            $pagination = $(that.pagination),
            pageSize = Math.ceil(pageTotality / this.pageNum),
            aDom = [],
            addDom = function(start, end, index){
                var dom ='';
                for(var i = start; i <= end; i++){
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
        if(pageSize <= that.pageRange){
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
        aDom.push('<a class="next" href="javascript:;">下一页</a></div>');
        $pagination.html(aDom.join('')).show();
    },
    //************* 添加过滤条件 ***************
    addClassify: function(obj){
        var that = this,
            $filerDiv = $(that.filerDiv),
            $items = $filerDiv.children(),
            sDom = [                    //添加的DOM
                '<a data-value="', obj.dataId , '" data-classify="', obj.classifiy,'" href="javascript:;">',
                '<label>', obj.classifyText ,'：</label>',
                '<span>', obj.text ,'</span>',
                '<span class="del" title="删除">x</span>',
                '</a>'
            ].join(''),
            flag = true,
            sCal;   //存放过滤的条件， 如 分类 品牌



        $items.each(function(index){
            //判断 item 是否存在
            sCal = $(this).find('label').text().slice(0,2);
            if(sCal === obj.classifyText){
                //替换掉筛选的条件
                $(sDom).replaceAll(this);
                flag = false;      //用来判断 是替换 还是 添加
            }
        });
        //添加 过滤条件
        if(flag){
            $filerDiv.append(sDom);
        }
        $filerDiv.show();
    }
};
var filterGoods = new FilterGoods({
    putGoodsDiv: '#goods-list',
    filerDiv: '.filter',
    pagination: '#pagination',
    pageNum: '20'
});