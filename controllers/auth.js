const User = require("../models/user");
const jwt = require("jsonwebtoken");
const {expressjwt: expressJwt} = require("express-jwt");
const {errorHandler} = require("../helpers/dbErrorHandler");
const user = require("../models/user");

exports.signup = (req, res)=>{
    console.log("req.body", req.body);
    const user = new User(req.body);
    user.save()
      .then((user)=>{
        user.salt  = undefined;
        user.hashed_password = undefined;
        res.json({user});
    })
      .catch((err) => {
        res.json({
          err:errorHandler(err)
        });
      });
}

exports.signin = (req, res) =>{
  const {email, password} = req.body;
  User.findOne({email})
   .then((user)=>{
    // if no user found
     if(!user){
      return res.status(400).json({error: "user with that email does not exists"})
     }
     //authenticate user. add authentication in model/user.js
      if(!user.authenticate(password)){
        return res.status(400).json({error: "email and password do not match"})
      }

    // if user found and authenticated
     const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET);
     res.cookie("t", token, {expire: new Date() + 9999});
     const {_id, name, email, role} = user;
     res.json({token, user: {_id, name, email, role}}); 

   })
   .catch(err => res.json({err}));
}

exports.signout = (req, res)=>{
  res.clearCookie("t");
  res.json({message: "signout success"});
}

exports.requireSignin = expressJwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  userProperty: "auth"
});

exports.isAuth = (req, res, next)=>{
  let user = req.profile && req.auth && req.profile._id == req.auth._id;
  if(!user){
    return res.status(403).json({error: "access denied"});
  }
  next();
}

exports.isAdmin = (req,res,next)=>{
  if(req.profile.role == 0 ){
    return res.status(403).json({error: "Admin resource! acess denied"})
  }
  next();
}