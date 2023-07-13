const mongoose = require('mongoose');

const Role = new mongoose.Schema({  // Creating the schema
    name: {
        type: String,
        required: true,
        trim: true  // remove white spaces from both ends of the name, rest can be taken care by frontend
    },
    email: {
        type: String,
        unique: true,
        trim:true,
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    role: {
        // admin or user
        type: String,
        required: true,
        trim: true,
        enum: ['admin', 'user'] // only these two roles are allowed
    }
})

module.exports = mongoose.model('Role', Role);