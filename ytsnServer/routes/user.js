const express = require('express');
//引入body-parser中间件
const bodyParser = require('body-parser');
//引入sesstion模块 存储用户状态
const session = require("express-session");
//引入连接池模块
const pool = require('../pool.js');
//创建路由器对象
var router = express.Router();

//使用body-parser中间件，将post请求的数据解析为对象
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({
  extended: false
}));
//5:配置session模块
router.use(session({
  secret: "128位字符串",//安全字符串
  resave: true,//请求时更新数据
  saveUninitialized: true//保存初始数据
}))



//管理员登录接口
router.post("/andmin",(req,res)=>{
  var andmin=req.body.user
  var upwd=req.body.upwd
  if(andmin==""){
    return;
  }
  if(upwd==""){
    return;
  }
  pool.query("select * from sn_andmin where andmin=? and upwd=md5(?)",[andmin,upwd],(err,result)=>{
    if(err) throw err;
    if(result.length>0){
      req.session.andmin=result[0].andmin
      res.send({code:1,msg:"欢迎管路员",result})
    }else{
      res.send({code:0,msg:"账号或密码错误"})
    }
  })
})

//查询是否登录
router.get("/isadn",(req,res)=>{
  var andmin=req.session.andmin
  if(!andmin){
    res.send({code:0,msg:"未登录"})
  }else{
    res.send({code:1,msg:"已登录",andmin})
  }
})

//添加路由
//登录接口
router.post("/userlogin", (req, res) => {
  //1.获取登录数据 
  var uname= req.body.uname
  var upwd= req.body.upwd
  //2.执行sql语句 查询用户名密码是否存在
  var sql = "select uid from sn_user where uname=? and upwd=?";
  pool.query(sql, [uname, upwd], (err, result) => {
    //如果错误抛出
    if (err) throw err;
    if (result.length > 0) {
      req.session.uid = result[0].uid;
      res.send({ code: 1, msg: '登录成功' })
    } else {
      res.send({ code: 0, msg: '登录失败' })
    }
  })
})
// 退出登录
router.get("/out", (req, res) => {
  var uid = req.session.uid;
  if (uid != "") {
    req.session.uid = "";
    res.send({ code: 1, msg: "退出登录成功" })
  }
})

/* 注册接口 */
router.post("/userReg", (req, res) => {
  //获取前端请求主体
  var obj = req.body;
  //执行sql语句
  var sql = "INSERT INTO sn_user SET ?"
  pool.query(sql, [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "注册成功" })
    } else {
      res.send({ code: 0, msg: "注册失败" })
    }
  })
})
// 上传头像
router.post("/userImg", (req, res) => {
  var { icon, uid } = req.body
  pool.query("update sn_user set icon=? where uid=?", [icon, uid], (err, result) => {
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "上传成功" })
    } else {
      res.send({ code: 0, msg: "上传失败" })
    }
  })
})
/*检查用户名是否存在*/
router.get("/username", (req, res) => {
  //获取前端数据
  var $regUname = req.query.uname;
  //执行sql语句
  var sql = "select * from sn_user where uname=?"
  pool.query(sql, [$regUname], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({code:1})
    } else {
      res.send({code:0})
    }
  })
})
/* 用户数据接口 */
router.post("/Xuser", (req, res) => {
  //var $uname=req.body.uname;
  pool.query("select * from sn_user", (err, result) => {
    if (err) throw err;
    res.send(result);
  })
})


/*查询是否登录*/
router.get("/user", (req, res) => {
  var uid = req.session.uid
  //var uid=1;
  if (!uid) {
    res.send({ code: 0, msg: "请登录" })
    return
  }
  var sql = `select uid,icon,uname from sn_user where uid=${uid}`
  pool.query(sql, (err, result) => {
    if (result.length > 0) {
      res.send({ code: 1, msg: "已登录", result })
    }
  })
})
//根据文章uid获取用户头像 用户名称
router.get("/text/user", (req, res) => {
  var uid = req.query.uid;
  var sql = `select icon,uname from sn_user where uid in(${uid})`
  pool.query(sql, (err, result) => {
    if (result.length > 0) {
      res.send(result)
    } else {
      res.send({ code: 0, msg: "无该用户数据" })
    }
  })
})
//添加游记
router.post("/travels", (req, res) => {
  var obj = req.body
  var sql = "INSERT INTO sn_travels SET ?"
  pool.query(sql, [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "游记添加成功" })
    } else {
      res.send({ code: 0, msg: "游记添加失败" })
    }
  })

})
//查询所有游记
router.get("/seek/travels", (req, res) => {
  pool.query("select uname,icon,himg,title,tid from sn_travels,sn_user where sn_travels.uid=sn_user.uid", (err, result) => {
    if (result.length > 0) {
      res.send(result)
    } else {
      res.send({ code: 0, msg: "查询失败" })
    }
  })
})
//根据文章id查询 文章内容
router.get("/tidtra", (req, res) => {
  var tid = req.query.tid
  console.log(tid)
  pool.query("select uname,icon,himg,title,tid,content,date,site,subhead from sn_travels,sn_user where sn_travels.uid=sn_user.uid and tid=?", [tid], (err, result) => {
    if (result.length > 0) {
      res.send({code:1,result})
    }else{
      res.send({code:0,msg:"无"})
    }
  })
})

//删除游记
router.post("/del/trvals", (req, res) => {
  var tid = req.body.tid
  var uid = req.body.uid
  pool.query("delete from sn_travels where tid=? and uid=?", [tid, uid], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "删除成功" })
    } else {
      res.send({ code: 0, msg: "删除失败" })
    }
  })
})
//根据用户uid查询游记
router.get("/seekUser/trvals/:uid", (req, res) => {
  var uid = req.params.uid
  pool.query("select uname,icon,himg,title,tid,date,site,subhead,content from sn_travels,sn_user where sn_travels.uid=sn_user.uid  uid=?", [uid], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send(result)
    } else {
      res.send({ code: 0, msg: "没有查到" })
    }
  })
})
//游记文章评论功能
router.post("/comment/tarval", (req, res) => {
  var obj = req.body
  console.log(obj)
  pool.query("insert into sn_comment set ?", [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "评论成功" })
    } else {
      res.send({ code: 0, msg: "评论失败" })
    }
  })
})
//添加攻略文章
router.post("/psp/text", (req, res) => {
  var obj = req.body
  pool.query("insert into sn_psp set ?", [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "添加成功" })
    } else {
      res.send({ code: 0, msg: "添加失败" })
    }
  })
})
//删除攻略
router.post("/psp/del", (req, res) => {
  var tid = req.body.tid
  var uid = req.body.uid
  pool.query("delete from sn_psp where gid=? and uid=?", [tid, uid], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "删除成功" })
    } else {
      res.send({ code: 0, msg: "删除失败" })
    }
  })
})
//查询所有攻略
router.get("/psp/all", (req, res) => {
  pool.query("select pid,icon,uname,himg,title,subhead,zan from sn_user,sn_psp where sn_user.uid=sn_psp.uid", (err, result) => {
    if (err) throw err;
    console.log(result);
    // pid,uid,icon,uname,himg,title,subhead,zan
    if (result.length > 0) {
      res.send(result)
    } else {
      res.send({ code: 0, msg: "无数据" })
    }
  })
})
//根据文章pid 查询
router.get("/psp/ptext", (req, res) => {
  var pid = req.query.pid
  console.log(pid)
  pool.query("select pid,icon,uname,himg,zan,date,site,title,subhead,content from sn_psp,sn_user where sn_user.uid=sn_psp.uid and pid=?", [pid], (err, result) => {
    if (err) throw err;
    console.log(result)
    if (result.length > 0) {
      res.send({code:1,result})
    } else {
      res.send({ code: 0, msg: "无" })
    }
  })
})
//用户发布的攻略
router.get("/psp/user/:uid", (req, res) => {
  var uid = req.params.uid
  pool.query("select * from sn_psp where uid=?", [uid], (err, result) => {
    if (result.length > 0) {
      res.send(result)
    } else {
      res.send({ code: 0, msg: "无数据" })
    }
  })
})                                     //评论的信息
// 攻略评论  //游记评论  需要参数 文章id  uid userImg  uname 评论内容comment
router.post("/psp/comment", (req, res) => {
  var obj = req.body
  console.log(obj)
  pool.query("insert into sn_comment set ?", [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "评论成功" })
    } else {
      res.send({ code: 0, msg: "评论失败" })
    }
  })
})
//根据攻略文章id 查询评论
router.get("/comment/pid", (req, res) => {
  var pid = req.query.pid
  pool.query("select uname,icon,comment from sn_comment,sn_user where sn_comment.uid=sn_user.uid and pid=?", [pid], (err, result) => {
    if (result.length > 0) {
      res.send({ code: 1, msg: "此文章攻略评论数据", result })
      console.log(result)
    } else {
      res.send({ code: 0, msg: "无此文章攻略评论数据" })
    }
  })
})
//根据游记文章id 查询评论
router.get("/comment/tid", (req, res) => {
  var tid = req.query.tid
  pool.query("select uname,icon,comment from sn_comment,sn_user where sn_comment.uid=sn_user.uid and tid=?", [tid], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({ code: 1, msg: "此文章游记评论数据", result })
    } else {
      res.send({ code: 0, msg: "无此游记攻略评论数据" })
    }
  })
})
//
router.get("/del", (req, res) => {
  pool.query("delete from sn_comment where pid=0", (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "全部删除成功" })
    }
  })
})

//发起结伴
router.post("/withfriend", (req, res) => {
  var obj = req.body
  pool.query("insert into sn_withfriend set ? ", [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "添加成功" })
    } else {
      res.send({ code: 0, msg: "添加失败" })
    }
  })
})
//结伴报名接口
router.post("/sign", (req, res) => {
  var obj = req.body;
  pool.query("insert into sn_sign set ?", [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "报名成功" })
    } else {
      res.send({ code: 0, msg: "报名失败" })
    }
  })
})
//结伴文章详情页面接口
router.post("/friend", (req, res) => {
  var fid = req.body.fid
  pool.query("select fid,icon,uname,day,text,title,loca,time from sn_withfriend,sn_user where sn_withfriend.uid=sn_user.uid and fid=?", [fid], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send(result)
    } else {
      res.send({ code: 0, msg: "没有查到" })
    }
  })
})
//查询结伴信息接口
router.get("/seachfriend", (req, res) => {
  pool.query("select fid,title,loca,time,text,day,uname,icon from sn_withfriend,sn_user where sn_withfriend.uid=sn_user.uid", (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({ code: 1, msg: "此结伴内容", result })
    } else {
      res.send({ code: 0, msg: "无内容" })
    }
  })
})
//结伴页面评论接口
router.post("/speak", (req, res) => {
  var obj = req.body;
  pool.query("insert into sn_speak set ?", [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "评论成功" })
    } else {
      res.send({ code: 0, msg: "评论失败" })
    }
  })
})


//结伴发表留言
router.post("/liu", (req, res) => {
  var obj = req.body;
  console.log(obj)
  pool.query("insert into sn_speak set ?", [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "发表成功" })
    } else {
      res.send({ code: 0, msg: "发表失败" })
    }
  })
})
//结伴查询当前评论回复
router.get("/sel", (req, res) => {
  var obj = req.query.fid;
  pool.query("select uname,icon,text from sn_speak,sn_user where sn_speak.uid=sn_user.uid and fid=?",
    [obj], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.send({ code: 1, msg: "评论查询成功", result })
      } else {
        res.send({ code: 0, msg: "评论查询失败" })
      }
    })
})
//查询已报名用户
router.get("/chauser",(req,res)=>{
  var fid=req.query.fid
  pool.query("select icon,uname,text from sn_sign,sn_user where sn_sign.uid=sn_user.uid and fid=?",[fid],(err,result)=>{
    if(err)throw err;
    if(result.length>0){
      res.send(result)
    }else{
      res.send({code:0,msg:"无法查询或无报名数据"})
    }
  })
})
//查询是否已报名   已报名返回1  否则返回0
router.get("/chab",(req,res)=>{
  var fid=req.query.fid
  var uid=req.session.uid
  console.log(fid,uid)
  if(!uid){
    res.send({code:0,msg:"未登录"})
  }
  pool.query("select * from sn_sign where fid=? and uid=?",[fid,uid],(err,result)=>{
    if(result.length>0){
      res.send({code:1,msg:"已报名"})
    }else{
      res.send({code:0})
    }
  })
})

//问答接口
router.get("/ask", (req, res) => {
  var uid = req.session.uid;
  if (uid == "") {
    res.send({ code: -1, masg: "请登录" })
    return;
  }
  var ask = req.query.ask;
  var title = req.query.title;
  var subtitle = req.query.subtitle;
  // console.log(uid,list,title,subtitle);
  pool.query("insert into sn_ask values(?,null,?,?,?)", [uid, title, subtitle,ask], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, masg: "问题发表成功", uid })
    } else {
      res.send({ code: 0, msg: "问题发表失败" })
    }
  })
})
//问答回复接口
router.post("/snow", (req, res) => {
  var obj = req.query;
  pool.query("insert into sn_ask set ?", [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "回复成功" })
    } else { res.send({ code: 0, msg: "回复失败" }) }
  })
})
// 查询问答的接口
router.get("/seachask", (req, res) => {
  pool.query("select aid,title,subtitle,ask,uname,icon from sn_ask,sn_user where sn_ask.uid=sn_user.uid order by aid desc", (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({ code: 1, msg: "此问答内容", result })
    } else {
      res.send({ code: 0, msg: "无内容" })
    }
  })
})
//根据提问id查询提问信息
router.get("/quetion", (req, res) => {
  var aid = req.query.aid
  console.log(aid)
  pool.query("select aid,title,subtitle,ask,uname,icon from sn_ask,sn_user where sn_ask.uid=sn_user.uid and aid=?", [aid], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({ code: 1, msg: "提问数据", result })
    } else {
      res.send({ code: 0, msg: "无数据" })
    }
  })
})
//评论
router.post('/miss', (req, res) => {
  var uid = req.session.uid;
  console.log(uid);
  if (!uid) {
    res.send({ code: -1 });
    return
  }
  var obj = req.body
  console.log(req.query)
  var sql = `INSERT INTO sn_miss set ?`;
  pool.query(sql, [obj], (err, result) => {
    if (err) throw err;
    if (result.affectedRows > 0) {
      res.send({ code: 1, msg: "回复成功" })
    } else {
      res.send({ code: -1 })
    }
  })
})

//根据aid查询回答数据
router.get("/huida", (req, res) => {
  var aid = req.query.aid
  console.log(aid)
  pool.query("select uname,icon,subtitle from sn_miss,sn_user where sn_miss.uid=sn_user.uid and aid=?", [aid], (err, result) => {
    if(err) throw err;
    if (result.length > 0) {
      res.send({ code: 1, msg: "提问回答数据" ,result})
    } else {
      res.send({ code: 0, msg: "无回答数据" })
    }
  })
})

//导出路由器对象
module.exports = router;