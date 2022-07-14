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
            likes: [req.user.id],
            dislike: []
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

    // for (let i = 0; i < thread.posts.length; i++) {
    //     try {
    //         thread.posts[i] = thread.posts[i].toObject();
    //         thread.posts[i].user = await User.findById(thread.posts[i].user_id, "-password");
    //         // thread.posts[i].ussername = user.username;
    //     } catch (error) {
    //         console.log("Error when getting a the user of a post on a thread",error)
    //     }
    // }

    res.status(200).json(thread);

});

//delete thread

app.delete("/thread/:id", async (req,res)=>{
    const id = req.params.id;
    //check if anyone is logged in
    if(!req.user){
        res.status(401).json({message:"Unauthed"});
        return;
    }

    let thread;
    try {
        thread = await Thread.findById(id);

    } catch (error) {
        res.status(500).json({message:err});
        return;
    }
    console.log(req.user);

    //check if the right person is logged in
    if(thread.user_id != req.user.id){
        res.status(403).json({message:"Forbidden"});
        return;
    }

    let response;
    try {
        response = await Thread.findByIdAndDelete(id,{new:true});
    } catch (error) {
        res.status(500).json({messsage:"IDK something is wrong"})
    }
    console.log(response.name, "was deleted");
    res.status(200).json(response);

});

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
app.delete("/thread/:thread_id/post/:post_id", async (req,res)=>{
    const thread_id = req.params.thread_id;
    const post_id = req.params.post_id;
    
    //if they are not logged in
    if(!req.user){
        res.status(401).json({message:"Unauthorized"});
        return;
    }
    let thread;
    //if they are not allowed to 
    try {
        thread = await Thread.findOne({
            _id:thread_id,
            "posts._id": post_id
        });
    } catch (error) {
        res.status(500).json({message:"An error has occured when gettting a post",
            error:error,
        });
        return;
    }

    if(!thread){
        res.status(404).json({message:`Could not find post ${post_id} on thread ${thread_id}`});
        return;
    }

    // console.log(thread);

    //now that we have the thread we need to find the post and see if the person trying to delete it is allowed to 
    let samePerson = false;
    let finPost;
    for (let post in thread.posts){
        // console.log(post)
        if(thread.posts[post]._id == post_id){
            finPost = post;
            // console.log(thread.posts[post], req.user.id);
            if(thread.posts[post].user_id == req.user.id) {
                samePerson = true;
                // console.log("something is fundementally broken")
            }
        }
    }

    if(!samePerson){
        res.status(403).json({message:"unauthed"});
        return;
    }
    // 62c7057bdc205f59012e7e4a
    // 62c7057bdc205f59012e7e4a
    //do it
    try {
        await Thread.findByIdAndUpdate(thread_id,{
            $pull: {
                posts: {
                    _id: post_id,
                },
            },
        });
    } catch (error) {
        res.status(500).json({message:`An error has occurred while deleting a post ${error}`});
        return;
    }

    res.status(200).json(finPost);

});

//add likes to a thread
app.post("/thread/:id/like", async (req,res)=>{
    const id = req.params.id;
    if(!req.user){
            res.status(401).json({message:"Must be logged in to preform this action"})
    }
    //need to check if it is not already in there
    let alreadyLiked = false;
    try {
        let temp = await Thread.findById(id);
        console.log(temp);
        for(let i = 0; i<temp.likes.length;i++){
            if(temp.likes[i] == req.user.id){
                alreadyLiked=true;
            }
        }
    } catch (error) {
        res.status(500).json({message:"An error occurred",error:error});
        return;
    }
    if(alreadyLiked){
        res.status(403).json({message:"Already liked"});
        return;
    }
    // need to get the thread and update the list to add the user id
    let thread;
    try {
        console.log(req.user);
        thread = await Thread.findByIdAndUpdate(id,
            {
                $push:{
                    likes: req.user.id,
                },
                
            },
            {
                new:true,
            }
        );
    } catch (error) {
        res.status(500).json({message:"An error has occured on the serever", error: error});
        return;
    }
    if(!thread){
        res.status(404).json({message:"Thread not found"});
        return;
    }
    res.status(201).json(thread);
});

//adds dislikes to the thread

app.post("/thread/:id/dislike", async (req,res)=>{
    const id = req.params.id;
    if(!req.user){
            res.status(401).json({message:"Must be logged in to preform this action"})
    }
    //need to check if it is not already in there
    let alreadyDisliked = false;
    try {
        let temp = await Thread.findById(id);
        for(let i = 0; i<temp.likes.length;i++){
            if(temp.likes[i] == req.user.id){alreadyDisliked=true;}
        }
    } catch (error) {
        res.status(500).json({message:"An error occurred",error:error});
        return;
    }
    if(alreadyDisliked){
        res.status(403).json({message:"Already disliked"});
        return;
    }
    // need to get the thread and update the list to add the user id
    let thread;
    try {
        console.log(req.user);
        thread = await Thread.findByIdAndUpdate(id,
            {
                $push:{
                    dislike: req.user.id,
                },
                
            },
            {
                new:true,
            }
        );
    } catch (error) {
        res.status(500).json({message:"An error has occurred on the server", error: error});
        return;
    }
    if(!thread){
        res.status(404).json({message:"Thread not found"});
        return;
    }
    res.status(201).json(thread);
});

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