const adminControllers = require('../controllers/adminControllers');
const express = require('express');
const router = express.Router();
const { authorizeAdmins } = require('../middlewares/authorize');

router.post("/addQuestion", authorizeAdmins, adminControllers.addQuestion);

router.patch("/editQuestion/:id", authorizeAdmins, adminControllers.editQuestion);

router.delete("/deleteQuestion/:id", authorizeAdmins, adminControllers.deleteQuestion);

router.patch("/addTestCases/:id", authorizeAdmins, adminControllers.addTestCases);

module.exports = router;