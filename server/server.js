const express = require('express');
const setUpAuth = require("./auth");
const setUpSession = require("./session");

const app = express();
const {User} = require("../persist/model");
const cors = require('cors');

app.use(cors());
app.use(express.json());

//this will have node serve the backend
app.use(express.static(`${__dirname}/../public`));


setUpSession(app);
setUpAuth(app);



app.post("/users", async (req,res)=>{
    try {
        let user = await User.create({
            username: req.body.username,
            password: req.body.password,
            fullname: req.body.fullname,
        });
        res.status(201).json(user);
    }catch(err){
        res.status(500).json({
            message:"post request failed to create user",
            error:err,
        });
    }
});

//post thread

//get thread

//get thread by id

//delete thread

//post post

//delete post



// this method is for testing  will get all of the stuff out of the users mongodb
// app.get("/users", async (req,res)=>{
//     try {
//         let thing = await User.find();
//         res.status(201).json(thing);
//     }catch(err){
//         res.status(500).json({
//             message:"post request failed to create user",
//             error:err,
//         });
//     }
// });

module.exports = app;