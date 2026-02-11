const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO

const logger = require("./logger");

module.exports = async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(MONGO_URI);
  console.log("conneted to DB")
};
