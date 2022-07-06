const express = require('express');
const setUpAuth = require("./auth");
const setUpSession = require("./session");

const app = express();
const {User, Thread} = require("../persist/model");

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
app.post("/thread", async (req,res)=>{
    //can not post without being logged in
    if (!req.user){
        res.status(401).json({message: "unauthed"});
        return;
    }

    try {
        let thread = await Thread.create({
            user_id: req.user.id,
            name:req.body.name,
            description: req.body.description,
            category: req.body.category,
        });
        res.status(201).json(thread);
    } catch (err){
        res.status(500).json({
            message: "could not create the thread",
            error:err,
        });
    }
});
//get thread

app.get("/thread", async (req,res)=>{
    try {
        let list = await Thread.find({}, "-posts");       
    } catch (error) {
        console.log("error in the get thread", error)
        res.status(500).json(error);
        return;
    }

    for (let i = 0; i < list.length; i++) {
        try {
            list[i] = list[i].toObject();
            let user = await User.findById(list[i].user_id, "-password");
            list[i].user = user;
        } catch (error) {
            console.log("Error when getting a thread",error)
        }
    }

    res.status(200).json(list);
});

//get thread by id
// app.get("/thread/:id",(req,res)=>{
//     const id = req.params.id;
//     try {
//         let thread = await Thread.findById(id);
//     } catch (error) {
        
//     }
// });

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