/**
 * Created by f on 2015/4/8.
 */
function FilterGoods(obj){
    this.putGoodsDiv = obj.putGoodsDiv;  //列表容器
    this.filerDiv = obj.filerDiv;    //过滤容器
    this.clickItems = obj.clickItems;
    this.dataNum = obj.dataNum || 20;   //显示数据数
    this.pagination = obj.pagination || null;  //页码容器
    this.pageNum = obj.pageNum || 7;   //显示页码数
    this.pageRange = obj.pageRange || 12;    //显示页码范围，默认12页， 超过压缩页码
    this.description = obj.description;  //种类
    this.url = obj.url;     //请求数据地址

    this.init();
}
FilterGoods.prototype = {
    constructor: FilterGoods,
    conf: {
        Action: 'product'
    },
    init: function(){
        var that = this;

        $(that.clickItems).on('click', function(){
            var $filerDiv = $(that.filerDiv),
                $filerItems = $filerDiv.children(),
                obj = {};

            obj.dataId = this.id;
            obj.classifiy = $(this).data('classify');
            obj.classifyText = that.description[obj.classifiy];
            obj.text = $(this).text();

            //论封装，这段代码不太好
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
            dataNum = that.dataNum,
            pageTotality;     //总数

        that.getData($filerDiv.children());  //获取传送参数
        $.ajax({
            type: 'post',
            dataType: 'json',
            url: that.url,
            data: conf,
            success: function(json){
                if(typeof  json === 'object'){
                    that.addList(json,dataNum);
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
            pageRange = that.pageRange,
            pageNum = that.pageNum,
            $pagination = $(that.pagination),
            pageSize = Math.ceil(pageTotality / this.dataNum),
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
        if(pageSize <= pageRange){
            aDom.push(addDom(1, pageSize, page));
        } else{           //超过设定的页码范围，压缩页码在
            if(page < pageNum){                 //后面加 "..."
                //判断显示页码数是否超过总页码数，超过将全部显示页码
                pageNum = pageSize <= pageNum ? pageSize : pageNum;
                aDom.push(addDom(1,pageNum,page));
                (pageNum !== pageSize)&&(aDom.push('<span>...</span><a class="go-page" href="javascript:;">' + pageSize + '</a>'));
            } else if(pageSize - page + 1 < pageNum){          //前面加 "..."
                aDom.push('<a class="go-page" href="javascript:;">1</a><span>...</span>');
                aDom.push(addDom(pageSize - pageNum + 1,pageSize,page));
            } else{
                aDom.push('<a class="go-page" href="javascript:;">1</a><span>...</span>');
                aDom.push(addDom(page - parseInt(pageNum / 2),page + parseInt(pageNum / 2),page));
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
            sCal = that.description[$(this).data('classify')];  //去得 筛选条件 的text
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
    putGoodsDiv: '#goods-list',  // 显示数据容器
    filerDiv: '.filter',        // 存放过滤条件容器
    pagination: '#pagination',  //显示页码
    clickItems: '.classify ul a',    //绑定 click
    dataNum: '20',       // 条数，默认20条
    pageRange: '10',       //页码范围，超过用 ... 压缩，默认12
    pageNum: '6',         //显示页码数，默认 7
    description: {
        'id': '分类',
        'name': '品牌'
    },
    url: 'static/js/test.json'    //请求数据地址
});