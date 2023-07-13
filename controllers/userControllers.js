const Question = require('../models/Questions');
const axios = require('axios');

async function runTestCases(code, testCases, languageId) {  // Function to run all the test cases
    const ACCESS_TOKEN = process.env.COMPILER_TOKEN; // Replace with your Sphere Engine API access token
    for (let testCase of testCases) {   // Looping through all the test cases
        const { input, expectedOutput } = testCase;
        try {
            const submissionId = await executeCode(code, input, ACCESS_TOKEN, languageId);  // Executing the code
                const submissionDetails = await getSubmissionDetails(submissionId, ACCESS_TOKEN, expectedOutput);   // Getting the submission details
                if (!submissionDetails.accepted) {  // If the submission is not accepted, then return the submission details
                    return {
                    ...submissionDetails
                    }
                }
        } catch (error) {
            console.error('Error running test cases:', error);
            throw error;
        }
    }

    return {    // If all the test cases are passed, then return the success message
        accepted: true,
        "message": "All test cases passed"
    }
}

async function executeCode(code, input, accessToken, languageId) {  // Function to execute the code
    try {
        const response = await axios.post('https://api.compilers.sphere-engine.com/api/v4/submissions', {   // Making a POST request to the Sphere Engine API
            source: code,
            input,
            compilerId: languageId,
            access_token: accessToken
        });

        const submissionId = response.data.id;  // Getting the submission id from the response
        return submissionId;    // Returning the submission id
    } catch (error) {
        console.error('Error executing code:', error);
        throw error;
    }
}

function delay(ms) {    // Function to delay the execution
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForExecutionCompletion(submissionId, accessToken) {  // Function to wait for the execution to complete
    const response = await axios.get(`https://api.compilers.sphere-engine.com/api/v4/submissions/${submissionId}?access_token=${accessToken}`); // Making a GET request to the Sphere Engine API
    const executing = response.data.executing; 
  
    if (executing) {    // If the execution is not completed, then wait for 1 second and then call the function recursively
      await delay(1000); // Wait for 1 second (adjust as needed)
      return waitForExecutionCompletion(submissionId, accessToken); // Recursively call the function
    } else {
      return response; // Return the response when execution is completed
    }
  }

async function getSubmissionDetails(submissionId, accessToken, expectedOutput) {    // Function to get the submission details
    try {   // Making a GET request to the Sphere Engine API
        let response = await waitForExecutionCompletion(submissionId, accessToken); // Waiting for the execution to complete
        if(response.data.result.status.name != "accepted"){ // If the submission is not accepted, then return the submission details
            return {
                accepted: false,
                status: "Error",
                error: response.data.result.status.name
            }
        }
        const outputUri = await response.data.result.streams.output.uri;    // Getting the output uri from the response
        const output = await axios.get(outputUri);  // Making a GET request to the output Data
        if (output.data == expectedOutput) {    // If the output is same as the expected output, then return the submission details
            return {
                accepted: true,
                status: "accepted",
                error: null
            }
        }
        else {  // If the output is not same as the expected output, then return the submission details
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

module.exports.submitCode = async (req, res) => {   // Controller to submit the code
    const { code, language } = req.body;    // Destructuring the request body
    const questionId = req.params.id;   // Getting the question id from the request params
    if (!code || !language) return res.status(400).json({   // Validating the request body
        error: 'Please provide all the required fields'
    });
    // Object containing the language id of all the supported languages
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
        question = await Question.findById(questionId); // Finding the question by id
    } catch (error) {   // If the question is not found, then send the error response
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
        const results = await runTestCases(code, testCases, languageId);    // Running all the test cases
        return res.status(200).json({
            results
        });
    } catch (error) {
        return res.status(500).json({
            error: error.message
        });
    }
}