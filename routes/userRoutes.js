const userControllers = require('../controllers/userControllers');
const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../middlewares/authorize');

router.post("/submitCode/:id", isLoggedIn, userControllers.submitCode);

module.exports = router;