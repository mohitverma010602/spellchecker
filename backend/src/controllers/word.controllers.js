import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { runAi } from "../utils/gemeniai.js";

const wordFinder = asyncHandler(async (req, res) => {
  try {
    const { word } = req.body;
    console.log(word);
    const suggestions = `{
      "prompt": "Provide detailed information about the word '${word}'. Include the following details in the JSON object and don't include prompt object in the json object: 
      - 'word': The word itself
      - 'meaning': A definition of the word
      - 'part_of_speech': The part of speech (e.g., noun, verb, adjective)
      - 'synonyms': A list of synonyms
      - 'antonyms': A list of antonyms
      - 'examples': Example sentences using the word
      - 'origin': The etymology of the word
      - 'usage': Any specific usage notes or tips
      - 'related_words': Words that are related or similar in context
      - 'frequency': How commonly the word is used in modern language
      - 'translations': Translations of the word in various languages
      - 'additional_info': Any other relevant information about the word"
    }"  
`;

    const gemini_response = await runAi(suggestions);
    const json_response = gemini_response.slice(
      gemini_response.indexOf("{"),
      gemini_response.lastIndexOf("}") + 1
    );
    const response = JSON.parse(json_response);

    res.status(200).json(new ApiResponse({ response }, "Message recieved"));
  } catch (error) {
    console.log(error);
    throw new ApiError("Error while generating text", 400);
  }
});

export { wordFinder };
