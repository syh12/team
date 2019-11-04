const express=require('express');
//引入body-parser中间件
const bodyParser=require('body-parser');
 //引入用户路由器
const userRouter=require('./routes/user.js');
const fiedRouter=require('./routes/fied.js');
const andminRouter=require('./routes/andmin.js');

const cors=require("cors");
var app=express();


app.listen(5050);
app.use(cors({
  //允许跨域url列表
  origin:["http://172.242.18.31:8080","http://localhost:8080","http://127.0.0.1:8080"],
  credentials:true//每次请求需要验证
}))
//使用body-parser中间件，将post请求的数据解析为对象
app.use( bodyParser.urlencoded({
  extended:false
}));
//托管静态资源到public目录  
app.use( express.static('public') );
// //使用路由器，挂载到/user下
app.use( '/user',userRouter );
app.use( '/fied',fiedRouter );
app.use( '/and',andminRouter );



