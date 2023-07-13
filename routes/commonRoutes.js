const commonControllers = require('../controllers/commonControllers');  // Importing the controllers
const express = require('express');
const router = express.Router();

router.post("/signup", commonControllers.signup);   // Using the controllers

router.post("/login", commonControllers.login);

router.get("/logout", commonControllers.logOut);

router.get("/allQuestions", commonControllers.getAllQuestions);

router.get("/question/:id", commonControllers.getQuestionById);

module.exports = router;