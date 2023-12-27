const express= require ("express")
const bodyparser=require("body-parser")
const userRouter=express.Router()
const authenticate=require('../authenticate')
const User = require('../models/user')
var passport=require('passport');
const cors=require('../cors')
userRouter.use(bodyparser.json())

userRouter.route('/') 
.options(cors.corsWithOptions,(req,res)=>{res.sendStatus(200)})

.get(cors.cors,(req,res,next) => {
 console.log("know we are tolking")
})
userRouter.route('/login') 
.post(cors.corsWithOptions, (req,res,next) => {
  
    passport.authenticate('local',(err,user,info)=>{
      if(err){
        return next(err)
      }
      if(!user){
        res.statusCode = 401;
        res.setHeader('Content-Type', 'application/json');
        res.json({success:false ,status: 'your loging unsuccessfuly ',err:info});
      }else{
        req.logIn(user,(err)=>{
          if(err){
            res.statusCode = 401;
            res.setHeader('Content-Type', 'application/json');
            res.json({success:false  ,status: 'liging unsuccessfuly ',err:'cold not login user'});
          }
          var token =authenticate.getToken({_id:req.user._id})
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({success:true,token:token ,status: 'you are logd in successfuly '});
        })
      }
      
    })(req,res,next)
  
  })
  
  userRouter.route('/logout') 
  .get(cors.corsWithOptions, (req, res,next) => {
    if (req.session) {
      req.session.destroy();
      res.clearCookie('session-id');
      res.redirect('/');
    }
    else {
      var err = new Error('You are not logged in!');
      err.status = 403;
      next(err)
    }
  });

  userRouter.route('/signup') 
  
  .post(cors.corsWithOptions, async (req, res, next) => {
    try {
      const user = await new Promise((resolve, reject) => {
        User.register(new User({ username: req.body.username }), req.body.password, (err, user) => {
          if (err) {
            console.log("Error in the if statement");
            reject(err);
          } else {
            if (req.body.firstname)
              user.firstname = req.body.firstname;
  
            if (req.body.lastname)
              user.lastname = req.body.lastname;
            user.save((err, user) => {
              if (err) {
                reject(err);
              } else {
                resolve(user);
              }
            });
          }
        });
      });
  
      passport.authenticate('local')(req, res, () => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'Registration Successful!' });
      });
    } catch (err) {
      console.log("Caught an error:", err);
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ err: err });
      next(err);
    }
  });
  

    
module.exports= userRouter