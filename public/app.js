const URL = "https://forum2022.codeschool.cloud"
let app = new Vue({
    el:'#app',
    data:{
        loginName:"",
        loginPassword:"",
        signupEmail:"",
        signupName:"",
        signupPassword:"",
        page:"login",
    },
    methods:{
        login:function(){
            this.postSession();
            
        },
        createUser:function(){
            this.postUser();
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
            let response = await fetch(`${URL}/user`,{
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
        }

    },
    // computed:{
    //     pageNumber:function(){
    //         if(!loggedIn){
    //             
    //         }
    //     },
    // },
    created: function(){
        this.getSession()
    }
});