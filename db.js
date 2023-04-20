const mongoose = require('mongoose');
const dotenv = require("dotenv")
dotenv.config()
const mongoURI = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster0.mvf57zm.mongodb.net/notes?retryWrites=true&w=majority`;
const connectToMongoose=()=>{
    mongoose.connect(mongoURI,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        },()=>{
        console.log("Connected to Mongoose");
    })
}
module.exports = connectToMongoose;





