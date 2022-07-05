// this is the file that will set up the session

const session = require("express-session");
const config = require("../config")

const setUpSessionStore = function(app){
    app.use(
        session({
            secret:config.session,
            resave: false,
            saveUninitialized: false,
    }))
}

module.exports = setUpSessionStore;