//dependencies
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const logger = require("morgan");
const cookieParser = require('cookie-parser')
require("dotenv").config();
require("./db/conn");

const port = process.env.PORT || 5000;
const app = express();

//middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(logger("dev"));

//Headers Accepted
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST,GET");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});

//Cors Policy
app.use(
    cors({
        origin: "*",
    })
);

//Routes
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Connected to the Server",
    });
});

//routes
const authRoutes = require("./router/auth");
const roleRoutes = require("./router/role");
const communityRoutes = require("./router/community");
const memberRoutes = require("./router/member");
app.use("/v1/auth", authRoutes);
app.use("/v1/community", communityRoutes);
app.use("/v1/member", memberRoutes);
app.use("/v1/role", roleRoutes);


//custom middlewares
app.use((req, res) => {
    res.status(404).send("404 Not Found");
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

//port listening
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})