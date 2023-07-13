// Importing all the required modules
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Middlewares
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

// Importing all the routes
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commonRoutes = require('./routes/commonRoutes');

// Using all the routes
app.use("/api/v1", commonRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1/admin", adminRoutes);

// Default route
app.get("/", (req, res)=>{
    res.redirect("https://github.com/Saurav-Navdhare/CP-platform-backend/blob/master/README.md")
})

// Connecting to the database
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    const Port = process.env.PORT || 3000;
    app.listen(Port, ()=>{
        console.log(`Server running on port ${Port}`);
    });
})