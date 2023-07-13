// A set of APIs for the admin to add, edit or delete the question. Create a Questions table in the DB.
// A set of APIs for the admin to add test cases to a question.

const Question = require("../models/Questions");

module.exports.addQuestion = async (req, res) => {  // Controller to add a question
    try {
        // Destructuring the request body
        const question = new Question({
            question: req.body.question,
            testCases: req.body.testCases,
            createdBy: req.body.id
        });
        // Saving the question to the database
        await question.save();
        return res.status(201).json({
            message: 'Question added successfully',
            id: question._id
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

module.exports.editQuestion = async (req, res) => { // Controller to edit a question
    try {
        let { newQuestion, newTestCases } = req.body;
        newQuestion = newQuestion.trim();
        // Validating the request body
        if (!newQuestion && !newTestCases) return res.status(400).json({
            error: 'Please provide new question or new test cases'
        });

        let question;
        try{
            // Finding the question by id
            question = await Question.findById(req.params.id);
        } catch(error) {
            return res.status(404).json({
                error: 'Question not found'
            });
        }
        // If question not found, then send the error response
        if (newQuestion) question.question = newQuestion;
        if (newTestCases && newTestCases.length!=0 ) question.testCases = newTestCases;
        await question.save();

        // Saving the question to the database
        return res.status(200).json({
            message: 'Question updated successfully',
            id: question._id
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}

module.exports.deleteQuestion = async (req, res) => {   // Controller to delete a question
    try {
        let question;
        try{
            question = await Question.findById(req.params.id);  // Finding the question by id
        } catch(error) {
            return res.status(404).json({
                error: 'Question not found' // If question not found, then send the error response
            });
        }
        await question.delete();    // Deleting the question
        return res.status(200).json({   // Sending the response
            message: 'Question deleted successfully',
            id: question._id
        });
    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }
}

module.exports.addTestCases = async (req, res) => {  // Controller to add test cases to a question
    try {
        const { testCases } = req.body; // moreTestCases is an array of test cases
        let question;   // Finding the question by id
        try{
            question = await Question.findById(req.params.id);  // Finding the question by id
        } catch(error) {
            return res.status(404).json({   // If question not found, then send the error response
                error: 'Question not found'
            });
        }
        if (!question) return res.status(404).json({    // If question not found, then send the error response
            error: 'Question not found'
        });
        question.testCases = [...question.testCases, ...testCases]; // Adding the test cases to the question
        await question.save();
        return res.status(200).json({   // Sending the response
            message: 'Test cases added successfully',
            id: question._id
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}