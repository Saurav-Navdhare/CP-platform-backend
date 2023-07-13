// A set of APIs for the admin to add, edit or delete the question. Create a Questions table in the DB.
// A set of APIs for the admin to add test cases to a question.

const Question = require("../models/Questions");

module.exports.addQuestion = async (req, res) => {
    try {
        const question = new Question({
            question: req.body.question,
            testCases: req.body.testCases,
            createdBy: req.body.id
        });
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

module.exports.editQuestion = async (req, res) => {
    try {
        let { newQuestion, newTestCases } = req.body;
        newQuestion = newQuestion.trim();
        if (!newQuestion && !newTestCases) return res.status(400).json({
            error: 'Please provide new question or new test cases'
        });

        let question;
        try{
            question = await Question.findById(req.params.id);
        } catch(error) {
            return res.status(404).json({
                error: 'Question not found'
            });
        }

        if (newQuestion) question.question = newQuestion;
        if (newTestCases && newTestCases.length!=0 ) question.testCases = newTestCases;
        await question.save();

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

module.exports.deleteQuestion = async (req, res) => {
    try {
        let question;
        try{
            question = await Question.findById(req.params.id);
        } catch(error) {
            return res.status(404).json({
                error: 'Question not found'
            });
        }
        await question.delete();
        return res.status(200).json({
            message: 'Question deleted successfully',
            id: question._id
        });
    } catch (err) {
        return res.status(500).json({
            error: err
        });
    }
}

module.exports.addTestCases = async (req, res) => {
    try {
        const { testCases } = req.body; // moreTestCases is an array of test cases
        let question;
        try{
            question = await Question.findById(req.params.id);
        } catch(error) {
            return res.status(404).json({
                error: 'Question not found'
            });
        }
        if (!question) return res.status(404).json({
            error: 'Question not found'
        });
        question.testCases = [...question.testCases, ...testCases];
        await question.save();
        return res.status(200).json({
            message: 'Test cases added successfully',
            id: question._id
        });
    } catch (err) {
        return res.status(500).json({
            error: err.message
        });
    }
}