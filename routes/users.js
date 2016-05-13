var express = require('express');
var router = express.Router();
var models=require('../models');
var util=require('../util');
var auth=require('../midware/auth')
//注册
router.get('/reg',auth.checkNotLogin, function(req, res, next) {
  res.render('reg',{title:'注册'});
});
/* GET users listing. */
router.get('/login',auth.checkNotLogin, function(req, res, next) {
  res.render('login',{title:'登录'});
});
router.post('/login',auth.checkNotLogin, function(req, res, next) {
  req.body.password=util.md5(req.body.password);
  models.User.findOne({username:req.body.username,password:req.body.password},function(err,doc){
         if(err){
           req.flash('error','用户登录失败');
           res.redirect('back');
         }else {
           if(doc){
             //登录成功后把查询到的user用户付给session的user属性
             req.session.user=doc;
             req.flash('error','用户登录成功');
             res.redirect('/');
           }else {
             req.flash('error','用户登录失败');
             res.redirect('back');
           }
         }
  })
});
router.get('/logout',auth.checkLogin, function(req, res, next) {
  req.session.user=null;
  res.redirect('/');
});
router.post('/reg',auth.checkNotLogin, function (req,res,next) {
  req.body.password=util.md5(req.body.password);
  req.body.avatar='http://secure.gravatar.com/avatar/'+util.md5(req.body.email)+'?s=48';
  models.User.create(req.body, function (err,doc) {
    if(err){
      req.flash('error','用户注册失败');
    }else {
      req.flash('success','用户注册成功');
      res.redirect('/users/login');
    }

  })
});
module.exports = router;
