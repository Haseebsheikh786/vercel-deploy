const mongoose = require("mongoose");
const { MONGODB_CONNECTION_STRING } = require("../config/index");
 
const dbConnect = async () => {
  try {
    const connect = await mongoose.connect(MONGODB_CONNECTION_STRING);
    console.log("Database connected");
  } catch (error) {
    console.log(`Error: ${error}`);
  }
};   
 
module.exports = dbConnect;
