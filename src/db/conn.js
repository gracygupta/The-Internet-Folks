require("dotenv").config();
const mongoose = require("mongoose");

//mongodb uri
const DB = process.env.DB_URI;

mongoose.set("strictQuery", true);

//connecting with db
mongoose
  .connect(DB)
  .then(() => {
    console.log("Connection Successful");
  })
  .catch((err) => console.log(err));




