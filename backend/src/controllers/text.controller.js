import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { runAi } from "../utils/gemeniai.js";

const checkText = asyncHandler(async (req, res) => {
  try {
    const { inputText } = req.body;
    const userId = req.user._id;
    const editedText = `
    You are an AI language model. I need your assistance in correcting the grammar of a given paragraph and providing explanations for the corrections. The output should be in the following JSON format:
    {
      "corrected_sentence": "<corrected sentence here>",
      "explanation": [
        {
          "output": "<explanation here>",
          "input_text": "<text here you are explaining>"
        }
      ]
    }

    The explanations should describe the grammatical categories such as noun, pronoun, verb, etc., and why the correction was made.

Here is the paragraph to correct and explain:
k
  ${inputText}
      `;

    let response = await runAi(editedText);
    response = response.substring(
      response.indexOf("{"),
      response.lastIndexOf("}") + 1
    );

    res.status(200).json(new ApiResponse({ response }, "Message recieved"));
  } catch (error) {
    console.log(error);
    throw new ApiError("Error while generating text", 400);
  }
});

const getSuggestions = asyncHandler(async (req, res) => {
  try {
    const { inputText } = req.body;
    const userId = req.user._id;
    const suggestions =
      inputText +
      "just explain the correct grammer for this and give the suggestions in the form of object in javascript";

    const response = await runAi(suggestions);
    console.log(response);

    res.status(200).json(new ApiResponse({ response }, "Message recieved"));
  } catch (error) {
    console.log(error);
    throw new ApiError("Error while generating text", 400);
  }
});

export { checkText, getSuggestions };
