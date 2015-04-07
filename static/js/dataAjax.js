/**
 * Created by Administrator on 2014/8/13.
 */
function DataAjax(container,pagination){
    this.container = container;
    this.pagination = pagination;
    var pageSize;            //总页码数
    var id = '';            //分类 id
    var name = '';          //品牌 name
}
DataAjax.prototype = {
    constructor: DataAjax,
    //*********添加过滤条件*********///
    addClassify: function(filters,element){
        var $filter = $(filters);
        var $filItem = $filter.children();
        var $this = $(element);

        var dtText = $this.parents('dl').find('dt').text().slice(0,2);    //过滤条件名
        var ID = $this[0].id;
        var dom;
        var flag = true;              //判断是否已选同一类型的条件

        $filter.show();
        $filItem.each(function(index){
            if(dtText == $($filItem[index]).text().slice(0,2)){
                switch(dtText){
                    case '分类':
                        dom = "<a href='javascript:;' data-id='" + ID + "'><label>分类：</label><span>" + $this.text() + "</span><span class='del' title='删除'>x</span></a>";
                        break;
                    case '品牌':
                        dom = "<a href='javascript:;' data-name='" + ID + "'><label>品牌：</label><span>" + $this.text() + "</span><span class='del' title='删除'>x</span></a>";
                        break;
                }
                $($filItem[index]).remove();
                //判断是否为第一个子元素
                if(index == 0){
                    $filter.prepend(dom);
                } else{
                    $filter.append(dom);
                }
                flag = false;
                return false;    //跳出 each();
            }
        });
        if(flag){
            switch(dtText){
                case '分类':
                    dom = "<a href='javascript:;' data-id='" + ID + "'><label>分类：</label><span>" + $this.text() + "</span><span class='del' title='删除'>x</span></a>";
                    break;
                case '品牌':
                    dom = "<a href='javascript:;' data-name='" + ID + "'><label>品牌：</label><span>" + $this.text() + "</span><span class='del' title='删除'>x</span></a>";
                    break;
            }
            $filter.append(dom);
        }
        this.getData(filters);    //获取id，name值
    },
    //*********删除过滤条件*********///
    delClassify: function(filters,element){
        var $filter = $(filters);
        var $filItem = $filter.children();
        var $this = $(element);
        var dtText = $this.parents('dl').find('dt').text().slice(0,2);    //过滤条件名
        $filItem.each(function(){
            if(dtText == $(this).text().slice(0,2)){
                $(this).remove();
                return false;
            }
        });
        if($filItem.length == 1){          //先计算出了length，才remover（）移除
            $filter.hide();
        }
        this.getData(filters);   ////获取id，name值
    },
    //**********获取id，name值*******///
    getData: function(filters){
        var $filter = $(filters);
        var $filItem = $filter.children();
        id = '';
        name = '';
        $filItem.each(function(){
            if($(this).data('id')){
                id = $(this).data('id');
            }
            else if($(this).data('name')){
                name = $(this).data('name');
            }
        });
    },
    addGoods: function(goods,page,num){
        var dom;
        $('#hot,#new').remove();
        $(this.container).html('');
        pageSize = Math.ceil(goods.length/num);
        if(pageSize <= 0){
            $(this.container).html("<p style='padding: 20px;'>暂无数据！</p>")
        } else{
            for(var i = (page-1)*num; i < page*num; i++){
                if(i < goods.length){
                    dom = "<li><a class='wrap' href='" +
                        goods[i].links +
                        "'><div class='wrap-img'><img src='" +
                        goods[i].picture +
                        "' title='" +
                        goods[i].title +
                        "'></div><div class='inner'><p title='" +
                        goods[i].title +
                        "'><strong>" +
                        goods[i].title +
                        "</strong></p><p title='" +
                        goods[i].price +
                        "'><strong>" +
                        goods[i].price +
                        "</strong></p><p title='" +
                        goods[i].company +
                        "'>" +
                        goods[i].company +
                        "</p></div></a></li>";
                    $(this.container).append(dom);
                }
            }
        }
        this.addPage(goods,page,num);
    },
    addPage: function(goods,page,num){
        var pageDom;
        $(this.pagination).html('').hide();
        pageSize = Math.ceil(goods.length/num);
        if(pageSize > 1){
            $(this.pagination).show();
            pageDom = "<div class='pagination'><a class='pre' href='javascript:;'>上一页</a>";
            if(pageSize <= 12 ){
                pageDom += this.addDom(1,pageSize,page);
            } else{                             //超出12页，页码压缩
                if( 7 >= page){                 //后面加 "..."
                    pageDom += this.addDom(1,11,page);
                    pageDom += "<span>...</span><a class='go-page' href='javascript:;'>" + pageSize + "</a>";
                } else if(5 > pageSize - page){          //前面加 "..."
                    pageDom += "<a class='go-page' href='javascript:;'>1</a><span>...</span>";
                    pageDom += this.addDom(pageSize - 10,pageSize,page);
                } else{
                    pageDom += "<a class='go-page' href='javascript:;'>1</a><span>...</span>";
                    pageDom += this.addDom(page -5,Number(page) + 3,page);
                    pageDom += "<span>...</span><a class='go-page' href='javascript:;'>" + pageSize + "</a>";
                }
            }
            pageDom += "<a class='next' href='javascript:;'>下一页</a></div>";
            $(this.pagination).html(pageDom);
        }
    },
    addDom: function(index,length,page){
        var dom ='';
        for(var i = index; i <= length; i++){
            if(i != page){
                dom += "<a class='go-page' href='javascript:;'>" + i + "</a>";
            }
            else{
                dom += "<span class='active'>" + i + "</span>";
            }
        }
        return dom;
    }
};

/////////********条件过滤查询***********//////////
var $pagination = $('#pagination');
var classify = new DataAjax('#goods-list',$pagination);
var $item = $('.classify ul li');

function goodsHandler(page,num){
    var goods = [], i,len;
    $.ajax({
        type: "POST",
        dataType: "json",
        url: "static/js/test.json",
        data: {Action:"product",ID:id,Name:name},
        success: function(json){
            for(i = 0, len = json.length; i < len; i++){
                if(id){
                    if(name){
                        if(json[i].ID === id && json[i].Name === name){
                            goods.push(json[i]);
                        }
                    } else{
                        if(json[i].ID === id){
                            goods.push(json[i]);
                        }
                    }
                } else{
                    if(name){
                        if(json[i].Name === name){
                            goods.push(json[i]);
                        }
                    } else{
                        goods.push(json[i]);
                    }
                }
            }
            classify.addGoods(goods,page,num);
        }
    });
}
$item.on('click','a',function(){
    $(this).toggleClass('active').parent().siblings().find('a').removeClass('active');
    if(this.className){
        classify.addClassify('.filter',$(this));
        goodsHandler(1,20);
        } else{
        classify.delClassify('.filter',$(this));
        goodsHandler(1,20);
    }
});
//点击'x'删除事件
$('.filter').on('click','.del',function(){
    var $filter = $('.filter');
    $(this).parent().remove();
    var dt = $item.parents('dl').find('dt');
    for(var i = 0; i < dt.length; i++){
        if($(this).parent().text().slice(0,2) == $(dt[i]).text().slice(0,2)){
            $(dt[i]).next().find('.active').removeClass('active');
            break;
        }
    }
    if($filter.children().length == 0){
        $filter.hide();
    }
    classify.getData('.filter');
    goodsHandler(1,20);
});

//***********pagination 分页***********//
$pagination.on('click','a',function(){
    var page;
    switch (this.className){
        case 'go-page':
            page = $(this).text();
            goodsHandler(page,20);
            $(window).scrollTop($('.sort').offset().top);
            break;
        case 'pre':
            page = $pagination.find('span.active').text();
            if(page != 1){
                goodsHandler(Number(page)-1,20);
                $(window).scrollTop($('.sort').offset().top);
            }
            break;
        case 'next':
            page = $pagination.find('span.active').text();
            if(page != pageSize){
                goodsHandler(Number(page)+1,20);
                $(window).scrollTop($('.sort').offset().top);
            }
            break;
    }
});


