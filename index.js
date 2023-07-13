const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
require('dotenv').config();

app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commonRoutes = require('./routes/commonRoutes');

app.use("/api/v1", commonRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1/admin", adminRoutes);

app.get("/", (req, res)=>{
    res.send("Hello world");
})

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>{
    const Port = process.env.PORT || 3000;
    app.listen(Port, ()=>{
        console.log(`Server running on port ${Port}`);
    });
})