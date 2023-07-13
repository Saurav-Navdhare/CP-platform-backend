const mongoose = require('mongoose');

const Role = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
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
        enum: ['admin', 'user']
    }
})

module.exports = mongoose.model('Role', Role);