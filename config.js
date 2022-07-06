const dotenv = require('dotenv');

// const port = 27018;
// const password = process.env.MONGO_PASSWORD;
const password = "password";
const user = "new_user";
const host = "localhost";
const db_name = "cs-forum-2022";
const mongo_port = 27017;
const http_port = 8080;
const session = "secretpassword";

module.exports = {
    host,
    db_name,
    http_port,
    mongo_port,
    password,
    user,
    session,
}