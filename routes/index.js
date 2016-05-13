var express = require('express');
var router = express.Router();
var models=require('../models');
var markdown=require('markdown').markdown;
/* GET home page. */
router.get('/', function(req, res, next) {
  var keyword=req.query.keyword;
  var search=req.query.search;
  var pageNum=parseInt(req.query.pageNum) || 1;
  var pageSize=parseInt(req.query.pageSize) || 2;
  var queryObj={};
  if(search){
    req.session.keyword=keyword;
  }
  keyword=req.session.keyword;
  var reg=new RegExp(keyword,'i');
  queryObj={$or:[{title:reg},{cont:reg}]};
  models.Article.find(queryObj).skip((pageNum-1)*pageSize).limit(pageSize).populate('user').exec(function(err,articles){
    articles.forEach(function (article) {
      article.cont=markdown.toHTML(article.cont);
    });
    models.Article.count(queryObj, function (err,count) {
      res.render('index', {
        articles: articles,
        totalPage:Math.ceil(count/pageSize),
        keyword:keyword,
        pageNum:pageNum,
        pageSize:pageSize
      });
    })
  })

});

module.exports = router;
