//this file is the one that will manage authentication

const passport = require("passport");
const LocalStrategy = require('passport-local');
// const { password } = require("../config");
const {User} = require("../persist/model");

passport.use(
    new LocalStrategy( async (username,password,done)=>{
    let user;
    try{
        user = await User.findOne({username:username, password:password});
        if(!user){
            //this did not exist in the db
            return done(null,false);
        }
        //successful attempt
        return done(null, user);
    } catch(err){
        //this is for errors
        return done(err);
    }
    })
);

const setUpAuth = function(app){
    app.use(passport.initialize());
    app.use(passport.authenticate("session"));

    passport.serializeUser(function(user, cb){
        cb(null,{id:user._id, username:user.username});
    });
    passport.deserializeUser(function(user,cb){
        return cb(null,user);
    });

    app.post("/session",passport.authenticate("local"), (req,res)=>{
        res.status(201).json({message:"success in creating session"});
    });

    app.get("/session",(req,res)=>{
        if(!req.user){
            res.status(401).json({message:"unauthed"});
            return;
        }
        res.status(200).json({message:"authed"});
    });
};

module.exports = setUpAuth;