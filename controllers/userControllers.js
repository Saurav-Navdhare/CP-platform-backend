const Question = require('../models/Questions');
const axios = require('axios');

async function runTestCases(code, testCases, languageId) {
    const ACCESS_TOKEN = process.env.COMPILER_TOKEN; // Replace with your Sphere Engine API access token
    for (let testCase of testCases) {
        const { input, expectedOutput } = testCase;
        try {
            const submissionId = await executeCode(code, input, ACCESS_TOKEN, languageId);
                const submissionDetails = await getSubmissionDetails(submissionId, ACCESS_TOKEN, expectedOutput);
                if (!submissionDetails.accepted) {
                    return {
                    ...submissionDetails
                    }
                }
        } catch (error) {
            console.error('Error running test cases:', error);
            throw error;
        }
    }

    return {
        accepted: true,
        "message": "All test cases passed"
    }
}

async function executeCode(code, input, accessToken, languageId) {
    try {
        const response = await axios.post('https://api.compilers.sphere-engine.com/api/v4/submissions', {
            source: code,
            input,
            compilerId: languageId,
            access_token: accessToken
        });

        const submissionId = response.data.id;
        return submissionId;
    } catch (error) {
        console.error('Error executing code:', error);
        throw error;
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForExecutionCompletion(submissionId, accessToken) {
    const response = await axios.get(`https://api.compilers.sphere-engine.com/api/v4/submissions/${submissionId}?access_token=${accessToken}`);
    const executing = response.data.executing;
  
    if (executing) {
      await delay(1000); // Wait for 1 second (adjust as needed)
      return waitForExecutionCompletion(submissionId, accessToken); // Recursively call the function
    } else {
      return response; // Return the response when execution is completed
    }
  }

async function getSubmissionDetails(submissionId, accessToken, expectedOutput) {
    try {
        let response = await waitForExecutionCompletion(submissionId, accessToken);
        if(response.data.result.status.name != "accepted"){
            return {
                accepted: false,
                status: "Error",
                error: response.data.result.status.name
            }
        }
        const outputUri = await response.data.result.streams.output.uri;
        const output = await axios.get(outputUri);
        if (output.data == expectedOutput) {
            return {
                accepted: true,
                status: "accepted",
                error: null
            }
        }
        else {
            return {
                accepted: false,
                status: "wrong answer",
                error: null
            }
        }

    } catch (error) {
        console.error('Error fetching submission details:', error);
        if (error) {
            return {
                accepted: false,
                status: "error",
                error: error.uri
            }
        }
    }
}

module.exports.submitCode = async (req, res) => {
    const { code, language } = req.body;
    const questionId = req.params.id;
    if (!code || !language) return res.status(400).json({
        error: 'Please provide all the required fields'
    });
    const languageIdObject = {  // Make sure the case of the language is same as the one in the object  
        "C": 11,
        "C++": 44,
        "Java": 10,
        "Python": 116,
        "JavaScript": 56,
        "Ruby": 17,
        "C#": 27,
        "Go": 114
    }
    let languageId, question;
    try {
        question = await Question.findById(questionId);
    } catch (error) {
        return res.status(404).json({
            error: 'Question not found'
        });
    }
    try {
        languageId = languageIdObject[language]; // this can also be converted by frontend and directly passed to backend
    }
    catch (error) {
        return res.status(400).json({
            error: 'Language not supported'
        });
    }
    try {
        const testCases = question.testCases;
        const results = await runTestCases(code, testCases, languageId);
        return res.status(200).json({
            results
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}