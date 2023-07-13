const Role = require('../models/Role');
const Question = require('../models/Questions');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

exports.signup = async (req, res) => {  // Signup controller
    let { name, email, password, role } = req.body;     // Destructuring the request body
    password = password.trim(); // remove white spaces from both ends of the name, rest can be taken care by frontend
    email = email.trim();   // remove white spaces from both ends of the name, rest can be taken care by frontend
    role = (role.trim()).toLowerCase(); // remove white spaces from both ends of the name, rest can be taken care by frontend

    // Validating the request body
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

    // Checking if the user is already registered
    const user = await Role.findOne({ email });
    
    if (user) return res.status(400).json({
        error: 'The same email is being used by other user'
    });
    
    // Encrypting the password
    const encryptedPassword = await bcrypt.hash(password, 10);
    const newUser = new Role({
        name,
        email,
        password: encryptedPassword,
        role
    });
    // Saving the user to the database
    await newUser.save();
    // Creating the access token
    const accessToken = jwt.sign({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role
    }, process.env.JWT_SECRET, {
        expiresIn: '1d' // expires in 1 day
    });
    // Sending the access token in the cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // expires in 1 day
    });
    // Sending the response
    return res.status(201).json({
        email,
        accessToken
    });
}

exports.login = async (req, res) => {      // Login controller
    let { email, password } = req.body;

    email = email.trim();   // remove white spaces from both ends of the name, rest can be taken care by frontend
    password = password.trim();

    // Checking if the user is registered
    const user = await Role.findOne({ email });
    // If not registered, then send the error response
    if (!user) return res.status(400).json({
        error: 'User is not registered'
    });
    // If registered, then compare the passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({
        error: 'Invalid credentials'
    });
    // If passwords match, then create the access token
    const accessToken = jwt.sign({
        id: user._id,
        email: user.email,
        role: user.role
    }, process.env.JWT_SECRET, {
        expiresIn: '1d'
    });
    // Send the access token in the cookie
    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    });
    // Send the response
    return res.status(200).json({
        email,
        accessToken
    });
}

module.exports.getAllQuestions = async (req, res) => {  // Get all questions controller
    const questions = await Question.find().sort({ createdAt: -1 });    // Sorting the questions in descending order of createdAt
    return res.status(200).json({
        questions
    });
}

module.exports.getQuestionById = async (req, res) => {  // Get question by id controller
    try {
        const question = await Question.findById(req.params.id);    // Finding the question by id
        if (!question) return res.status(404).json({    // If question not found, then send the error response
            error: 'Question not found'
        });
        return res.status(200).json({   // If question found, then send the response
            question
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

module.exports.logOut = (req, res) => {  // Logout controller
    res.clearCookie('accessToken');   // Clearing the access token cookie
    return res.status(200).json({   
        message: 'Logged out successfully'  // Sending the response
    });
}