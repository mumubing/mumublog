var express = require('express');
var router = express.Router();
var auth=require('../midware/auth');
var markdown=require('markdown').markdown;
var models=require('../models');
var multer=require('multer');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now()+'.'+(file.mimetype.slice(file.mimetype.indexOf('/')+1)))
    }
})

var upload = multer({ storage: storage })

router.get('/add',auth.checkLogin, function(req, res, next) {

    res.render('add',{article:{}});
});
//什么时候用req,res
router.post('/add',auth.checkLogin,upload.single('poster'), function (req,res,next) {
    var article=req.body;
    var _id=article._id;
    if(_id){
        var updateObj={title:article.title,cont:article.cont};
        if(req.file){
            updateObj.poster='/uploads/'+req.file.filename;
        }
        models.Article.update({_id:_id},{$set:updateObj},function (err,result) {
            res.redirect('/');
        })
    }else{
        if(req.file){
            article.poster='/uploads/'+req.file.filename;
        }
        article.user=req.session.user._id;
        models.Article.create(article, function (err,doc) {
            if(err){
                req.flash('error','文章发表失败');
            }else {
                req.flash('success','文章发表成功');
                res.redirect('/');
            }
        });
    }

});
router.get('/detail/:_id',function (req,res) {
    var id=req.params._id;
    models.Article.findById(id,function (err,article) {
        article.cont=markdown.toHTML(article.cont);
        res.render('detail',{article:article});
    })
});
router.get('/delete/:_id',function (req,res) {
    var id=req.params._id;
    models.Article.remove({_id:id},function (err,result) {
        res.redirect('/');
    })
});
router.get('/edit/:_id',function (req,res) {
    var id=req.params._id;
    models.Article.findById(id,function (err,article) {
        res.render('add',{article:article});
    })
});
router.post('/comment',auth.checkLogin,function(req,res){
	var user=req.session.user;
	models.Article.update({_id:req.body._id},{$push:{comments:{user:user._id,cont:req.body.cont}}},function (err,result) {
        if(err){
            req.flash('error',err);
        }
        res.redirect('back');
    })
})
module.exports = router;
