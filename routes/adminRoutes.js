const adminControllers = require('../controllers/adminControllers');    // Importing the controllers
const express = require('express');
const router = express.Router();
const { authorizeAdmins } = require('../middlewares/authorize');    // Importing the middlewares

router.post("/addQuestion", authorizeAdmins, adminControllers.addQuestion);  // Using the controllers

router.patch("/editQuestion/:id", authorizeAdmins, adminControllers.editQuestion);

router.delete("/deleteQuestion/:id", authorizeAdmins, adminControllers.deleteQuestion);

router.patch("/addTestCases/:id", authorizeAdmins, adminControllers.addTestCases);

module.exports = router;