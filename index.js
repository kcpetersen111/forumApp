// let express = require('express');
// let mongoose = require('mongoose');
// let cors = require('cors');


const app = require('./server/server');
// const mongo_port = 8080;
const db = require('./persist/mongo');
const config = require("./config");

db.configureHandlers(()=>{
    app.listen(config.http_port, ()=>{
        console.log(`Server is listening on port ${config.http_port}`);
    });
});
// user,password,host,port,db_name
db.connect(config.user,config.password,config.host,config.mongo_port,config.db_name);
