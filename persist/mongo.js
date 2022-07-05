let mongoose = require('mongoose');
const db = mongoose.connection;

function configureHandlers(callback){
    db.once("connecting",()=>{
        console.log("connecting to the database");
    });
    db.once("connected",()=>{
        console.log("connected to the database");
    });
    db.once("open",()=>{
        console.log("connection to the database is open");
        callback();
    });
    db.once("error",()=>{
        console.log("connecting to the database");
    });
};

function connect(user,password,host,port,db_name){
    // password = encodeURI(password);
    // const connectionString = `mongodb+srv://kcpetersen:${password}@cluster0.crhdmiu.mongodb.net/?retryWrites=true&w=majority`;
    const connectionString = encodeURI(`mongodb://${user}:${password}@${host}:${port}/${db_name}`);
    
    mongoose.connect(connectionString,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}

module.exports = {
    configureHandlers,
    connect,
}