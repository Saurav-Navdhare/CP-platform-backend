const commonControllers = require('../controllers/commonControllers');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/authorize');

router.post("/signup", commonControllers.signup);

router.post("/login", commonControllers.login);

router.get("/logout", commonControllers.logOut);

router.get("/allQuestions", commonControllers.getAllQuestions);

router.get("/question/:id", isLoggedIn, commonControllers.getQuestionById);

module.exports = router;