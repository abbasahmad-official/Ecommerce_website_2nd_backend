const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { check, validationResult } = require('express-validator');
const cors = require("cors");
require("dotenv").config();
// routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/category");
const productRoutes = require("./routes/product");
// const transactionRoutes = require("./routes/transaction");
const orderRoutes = require("./routes/order");
const { stripeRouter, webhookRoute } = require("./routes/transaction");

// app
const app = express();

// database
mongoose.connect(process.env.MONGO_URI).then(()=> {
    console.log("database is connected")
})

//middlewares
 app.use(morgan("dev"));
 app.use(cookieParser());
 app.use(cors());
 app.use("/webhook", webhookRoute);
 app.use(bodyParser.json());
    // {
//   origin: "https://ecommerce-frontend-oyzc.vercel.app", // your frontend URL
//   credentials: true, // allow cookies and headers if needed
// }));
            // app.use(expressValidator());
// routes  middleware  
app.use("/api", authRoutes);
app.use("/api", userRoutes);
app.use("/api", categoryRoutes);
app.use("/api", productRoutes);
app.use("/api", stripeRouter);
app.use("/api", orderRoutes);


const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log("port is running on", port);
});