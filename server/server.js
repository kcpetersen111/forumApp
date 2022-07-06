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
    let list;
    try {
        list = await Thread.find({}, "-posts");       
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

// get thread by id
app.get("/thread/:id", async (req,res)=>{
    const id = req.params.id;
    let thread;
    try {
        thread = await Thread.findById(id);
    } catch (error) {
        console.log("error in getting the post from the db", error);
        res.status(500).json(error);
        return;
    }

    try {
        thread = thread.toObject()
        let user = await User.findById(thread.user_id);
        thread.user = user;

    } catch (error) {
        console.log("Error in getting the user for a thread by id", error);
        // res.status(500).json(error);
        // return;
    }

    for (let i = 0; i < thread.posts.length; i++) {
        try {
            thread.posts[i] = thread.posts[i].toObject();
            thread.posts[i].user = await User.findById(thread.posts[i].user_id, "-password");
            // thread.posts[i].ussername = user.username;
        } catch (error) {
            console.log("Error when getting a the user of a post on a thread",error)
        }
    }

    res.status(200).json(thread);

});

//delete thread


//post post
app.post("/post", async (req,res)=>{
    if(!req.user){
        res.status(401).json({message:"unauthed"});
        return;
    };

    let thread;
    try{
        thread = await Thread.findByIdAndUpdate(
            //what is the id
            req.body.thread_id,
            //what to update
            {
                $push:{
                    posts:{
                        user_id: req.user.id,
                        body: req.body.body,
                        thread_id:req.body.thread_id,
                    },
                },
            },
            //options
            {
                new: true,
            }
        );

        if(!thread){
            res.status(404).json({
                message: "thread not found",
                id: req.body.thread_id
            });
            return;
        };
    } catch(error){
        res.status(500).json({
            messsage: 'failed to insert post',
            error:error,
        });
    }

    

    res.status(201).json(thread.posts[thread.posts.length-1]);
});
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