// const URL = "https://forum2022.codeschool.cloud"
const URL = "http://localhost:8080"
let app = new Vue({
    el:'#app',
    data:{
        loginName:"",
        loginPassword:"",
        signupEmail:"",
        signupName:"",
        signupPassword:"",
        page:"login",
        threads:[],
        currentThread:{},
        createThreadName:"",
        createThreadCategory:"",
        createThreadDescription:"",
        creatingThread:false,
        creatingPost:false,
        createPostBody:"",
    },
    methods:{
        login:function(){
            this.postSession();
            this.page = 'homePage';
            
        },
        createUser:function(){
            this.postUser();
        },
        openThread: function(thread){
            this.getThreadByID(thread._id);
            this.page = "thread";
            // this.currentThread = thread;
        },
        getSession: async function(){
            let response = await fetch(`${URL}/session`, {
                method:"GET",
                credentials:"include"
            });

            //are we logged in
            if(response.status == 200){
                console.log("logged in");
                let data = await response.json();
                console.log(data);
                this.loggedIn = true;
                this.page = 'homePage';

            } else if(response.status == 401){
                console.log("not logged in");
                let data = await response.json();
                console.log(data);
            } else{
                console.log("There was some sort of error. ", response.status, response);
            }

        },
        // Post session
        postSession: async function(){

            let loginbody = {
                username: this.loginName,
                password: this.loginPassword
            };

            let response = await fetch(`${URL}/session`, {
                method: "POST",
                body: JSON.stringify(loginbody),
                headers:{
                    "Content-Type": "application/json"
                },
                credentials: "include"
            });

            try {
                let body = await response.json();
                console.log(body);
                
            } catch (error) {
                console.log("response body was not json");
            }
            

            if(response.status ==201){
                console.log("Successful login attempt")
                this.loginName ="";
                this.loginPassword ="";
                this.loggedIn = true;
                

            }else if(response.status ==401){
                console.log("Unsuccessful login attempt")
                this.loginPassword ="";
                alert("log in failed")

            } else {
                console.log("There was some sort of error. ", response.status, response);

            }
            // console.log(response)
        },

        //post user

        postUser: async function(){
            let userBody={
                username:this.signupEmail,
                fullname:this.signupName,
                password:this.signupPassword
            }
            let response = await fetch(`${URL}/users`,{
                method:"POST",
                body:JSON.stringify(userBody),
                headers:{"Content-Type":"application/json"},
                credentials:"include"
            });

            let body = await response.json();
            console.log(body);

            if(response.status == 201){
                console.log("User successfully created");
            }// else if () {}
        },

        //get threads
        getThreads: async function(){
            let response = await fetch(`${URL}/thread`,{
                credentials:"include"
            });
            let data = await response.json()
            // console.log(data);
            this.threads = data;
            console.log(data)
        },
        //get the posts(comments) on a thread
        getThreadByID: async function(id){
            let response = await fetch(`${URL}/thread/${id}`, {
                credentials:"include"
            });
            let data = await response.json();
            this.currentThread = data;
            // console.log(this.currentThread);
        },
        

        //create new thread
        postThread: async function(){
            let thread = {
                "name":this.createThreadName,
                "category":this.createThreadCategory,
                "description":this.createThreadDescription,
                "author":this.loginName
            }
            
            let response = await fetch(`${URL}/thread`,{
                method:"POST",
                credentials:"include",
                body:JSON.stringify(thread),
                headers:{"Content-Type":"application/json"}
            });
            let body = await response.json();
            console.log(body);
            this.getThreads();
        },

        //add a comment/post
        postPost: async function(thread){
            let body = {
                "thread_id":thread._id,
                "body":this.createPostBody
            }
            // console.log(body);

            let response = await fetch(`${URL}/post`,{
                method:"POST",
                credentials:"include",
                body: JSON.stringify(body),
                headers:{"Content-Type":"application/json"}
            });
            let responseBody =await response.json();
            console.log(responseBody);
            this.getThreadByID(thread._id);
            this.createPostBody = "";
        },
        //delete thread

        deleteThread: async function(thread){
            let response = await fetch(`${URL}/thread/${thread._id}`,{
                method:"DELETE",
                credentials:"include",
                headers:{"Content-Type":"application/json"}
            });
            let body = await response.json();

            console.log(body);
            this.getThreads();
            this.page = 'homePage';
        },

        //delete post
        deletePost: async function(post){
            //finish this
            console.log("test");
        },


    },
    // computed:{
    //     pageNumber:function(){
    //         if(!loggedIn){
    //             
    //         }
    //     },
    // },
    created: function(){

        // document.addEventListener("backbutton",this.test(), false);

        this.getSession();
        this.getThreads();
    }
});