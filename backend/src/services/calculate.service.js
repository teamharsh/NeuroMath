const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENERATIVEAI_API_KEY);

async function analyzeImage(img, dict_of_vars) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const dictOfVarsStr = JSON.stringify(dict_of_vars, null, 2);
  const base64Data = img.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `You are an expert AI assistant skilled in solving mathematical problems presented in images. Your task is to analyze the image and provide accurate solutions based on the following guidelines.

    **General Instructions:**

    *   **PEMDAS Rule:** Strictly adhere to the PEMDAS order of operations (Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right)).
    *   **Variable Substitution:** You are provided with a dictionary of user-defined variables: ${dictOfVarsStr}. If any expression in the image contains these variables, substitute them with their corresponding values from the dictionary before solving.
    *   **Output Format:** Always return your answer as a JSON-formatted list of dictionaries. Ensure that keys and values in the dictionaries are properly quoted to be compatible with Python's . Do not use backticks or markdown formatting in your response. Escape special characters like \\f, \\n, etc., as \\\\f, \\\\n.
    **Specific Cases:**

    1.  **Simple Mathematical Expressions:**
        *   **Example:** 2 + 3 * 4
        *   **Response:** \`\`\`json\n[{\'expr\': \'2 + 3 * 4\', \'result\': 14}]\n\`\`\`

    2.  **Systems of Equations:**
        *   **Example:** x^2 + 2x + 1 = 0, 3y + 4x = 0 (Assume x = 2, y = 5 after solving)
        *   **Response:** \`\`\`json\n[{\'expr\': \'x\', \'result\': 2, \'assign\': True}, {\'expr\': \'y\', \'result\': 5, \'assign\': True}]\n\`\`\`
        *   Include an entry for each variable solved.

    3.  **Variable Assignments:**
        *   **Example:** x = 4, y = 5
        *   **Response:** \`\`\`json\n[{\'expr\': \'x\', \'result\': 4, \'assign\': True}, {\'expr\': \'y\', \'result\': 5, \'assign\': True}]\n\`\`\`
        *   Mark these with "assign": True.

    4.  **Graphical Math Problems:**
        *   These are word problems represented visually (e.g., physics problems, geometry, data interpretation from charts, etc.).
        *   Pay close attention to all visual cues, including colors and labels.
        *   **Response:** \`\`\`json\n[{\'expr\': \'description of the problem\', \'result\': calculated\_answer}]\n\`\`\`

    5.  **Abstract Concepts:**
        *   The image may depict abstract concepts (e.g., love, hate, a historical event).
        *   **Response:** \`\`\`json\n[{\'expr\': \'explanation of the drawing\', \'result\': \'the abstract concept\'}]\n\`\`\`

    Analyze the image and provide your solution as a JSON-formatted list of dictionaries, following the guidelines above.
    `;

  const image = {
    inlineData: {
      data: base64Data,
      mimeType: "image/png",
    },
  };

  try {
    const result = await model.generateContent([prompt, image]);
    const res = result.response.text();

    let answers = [];
    try {
      const jsonString = res.replace(/```json\n|```/g, '');
      const jsonStringClean = jsonString.replace(/'/g, '"');
      answers = JSON.parse(jsonStringClean);
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError, "Response from Gemini:", res);
      answers = [];
    }

    answers.forEach(answer => answer.assign = answer.assign || false);
    return answers;

  } catch (error) {
    console.error("Error calling Gemini API:", error, "Error Details:", error.details);
    return [];
  }
}

module.exports = { analyzeImage };
