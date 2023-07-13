const Role = require('../models/Role');
const Question = require('../models/Questions');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {
    let { name, email, password, role } = req.body;
    password = password.trim(); // remove white spaces from both ends of the name, rest can be taken care by frontend
    email = email.trim();
    role = (role.trim()).toLowerCase();

    if (!name || !email || !password || !role) return res.status(400).json({
        error: 'All fields are required'
    })
    else if (!validator.isEmail(email)) return res.status(400).json({
        error: 'Invalid email'
    })
    else if(!(/^[a-z0-9]+$/).test(password)) return res.status(400).json({
        error: 'Password must contain only alphanumeric characters'
    })
    else if (password.length < 8) return res.status(400).json({
        error: 'Password must be at least 8 characters long'
    })
    else if (role !== 'admin' && role !== 'user') return res.status(400).json({
        error: 'Invalid role'
    })

    const user = await Role.findOne({ email });
    
    if (user) return res.status(400).json({
        error: 'The same email is being used by other user'
    });
    
    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = new Role({
        name,
        email,
        password: encryptedPassword,
        role
    });
    await newUser.save();
    const accessToken = jwt.sign({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
    }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    });
    return res.status(201).json({
        email,
        accessToken
    });
}

exports.login = async (req, res) => {
    let { email, password } = req.body;
    email = email.trim();
    password = password.trim();
    const user = await Role.findOne({ email });
    if (!user) return res.status(400).json({
        error: 'User is not registered'
    });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({
        error: 'Invalid credentials'
    });
    const accessToken = jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role
    }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    });
    return res.status(200).json({
        email,
        accessToken
    });
}

module.exports.getAllQuestions = async (req, res) => {
    const questions = await Question.find().sort({ createdAt: -1 });
    return res.status(200).json({
        questions
    });
}

module.exports.getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);
        if (!question) return res.status(404).json({
            error: 'Question not found'
        });
        return res.status(200).json({
            question
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

module.exports.logOut = (req, res) => {
    res.clearCookie('accessToken');
    return res.status(200).json({
        message: 'Logged out successfully'
    });
}