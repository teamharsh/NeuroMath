const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GENERATIVEAI_API_KEY);

async function analyzeImage(img, dict_of_vars) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const dictOfVarsStr = JSON.stringify(dict_of_vars, null, 2);
  const base64Data = img.replace(/^data:image\/\w+;base64,/, "");

  const prompt = `You are an expert AI assistant skilled in solving mathematical problems with detailed step-by-step explanations. Your task is to analyze the image and provide comprehensive solutions with intermediate steps, especially for calculus and algebraic problems.

    **General Instructions:**

    *   **PEMDAS Rule:** Strictly adhere to the PEMDAS order of operations (Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right)).
    *   **Variable Substitution:** You are provided with a dictionary of user-defined variables: ${dictOfVarsStr}. If any expression in the image contains these variables, substitute them with their corresponding values from the dictionary before solving.
    *   **Step-by-Step Solutions:** For complex problems, provide detailed intermediate steps showing the mathematical reasoning and transformations.
    *   **Output Format:** Always return your answer as a JSON-formatted list of dictionaries. Ensure that keys and values in the dictionaries are properly quoted to be compatible with Python's json.loads(). Do not use backticks or markdown formatting in your response. Escape special characters like \\f, \\n, etc., as \\\\f, \\\\n.

    **Enhanced Response Format:**
    Each solution object should include:
    - "expr": the original expression
    - "result": the final answer
    - "assign": boolean indicating if this is a variable assignment
    - "problem_type": type of problem ("algebra", "calculus", "arithmetic", "geometry", "other")
    - "steps": array of step objects with "description" and "expression" for multi-step problems
    - "method": the mathematical method or technique used

    **Specific Cases:**

    1.  **Simple Mathematical Expressions:**
        *   **Example:** 2 + 3 * 4
        *   **Response:** \`\`\`json\n[{"expr": "2 + 3 * 4", "result": "14", "assign": false, "problem_type": "arithmetic", "steps": [{"description": "Apply PEMDAS: multiplication first", "expression": "2 + 12"}, {"description": "Add the numbers", "expression": "14"}], "method": "Order of Operations"}]\n\`\`\`

    2.  **Calculus Problems (Derivatives):**
        *   **Example:** d/dx(x^2 + 3x + 1)
        *   **Response:** \`\`\`json\n[{"expr": "d/dx(x^2 + 3x + 1)", "result": "2x + 3", "assign": false, "problem_type": "calculus", "steps": [{"description": "Apply power rule to x^2", "expression": "d/dx(x^2) = 2x"}, {"description": "Apply power rule to 3x", "expression": "d/dx(3x) = 3"}, {"description": "Derivative of constant is 0", "expression": "d/dx(1) = 0"}, {"description": "Combine all terms", "expression": "2x + 3 + 0 = 2x + 3"}], "method": "Power Rule"}]\n\`\`\`

    3.  **Calculus Problems (Integrals):**
        *   **Example:** ∫(2x + 1)dx
        *   **Response:** \`\`\`json\n[{"expr": "∫(2x + 1)dx", "result": "x^2 + x + C", "assign": false, "problem_type": "calculus", "steps": [{"description": "Integrate 2x using power rule", "expression": "∫2x dx = 2 * (x^2/2) = x^2"}, {"description": "Integrate constant 1", "expression": "∫1 dx = x"}, {"description": "Add constant of integration", "expression": "x^2 + x + C"}], "method": "Power Rule Integration"}]\n\`\`\`

    4.  **Algebraic Equation Solving:**
        *   **Example:** 2x + 5 = 13
        *   **Response:** \`\`\`json\n[{"expr": "2x + 5 = 13", "result": "x = 4", "assign": true, "problem_type": "algebra", "steps": [{"description": "Subtract 5 from both sides", "expression": "2x + 5 - 5 = 13 - 5"}, {"description": "Simplify", "expression": "2x = 8"}, {"description": "Divide both sides by 2", "expression": "x = 8/2"}, {"description": "Final answer", "expression": "x = 4"}], "method": "Linear Equation Solving"}]\n\`\`\`

    5.  **Systems of Equations:**
        *   **Example:** x + y = 5, 2x - y = 1
        *   **Response:** \`\`\`json\n[{"expr": "x + y = 5, 2x - y = 1", "result": "x = 2, y = 3", "assign": true, "problem_type": "algebra", "steps": [{"description": "Add equations to eliminate y", "expression": "(x + y) + (2x - y) = 5 + 1"}, {"description": "Simplify left side", "expression": "3x = 6"}, {"description": "Solve for x", "expression": "x = 2"}, {"description": "Substitute x = 2 into first equation", "expression": "2 + y = 5"}, {"description": "Solve for y", "expression": "y = 3"}], "method": "Elimination Method"}, {"expr": "x", "result": "2", "assign": true, "problem_type": "algebra"}, {"expr": "y", "result": "3", "assign": true, "problem_type": "algebra"}]\n\`\`\`

    6.  **Factoring:**
        *   **Example:** x^2 + 5x + 6
        *   **Response:** \`\`\`json\n[{"expr": "x^2 + 5x + 6", "result": "(x + 2)(x + 3)", "assign": false, "problem_type": "algebra", "steps": [{"description": "Find two numbers that multiply to 6 and add to 5", "expression": "2 * 3 = 6 and 2 + 3 = 5"}, {"description": "Write as factored form", "expression": "(x + 2)(x + 3)"}], "method": "Factoring by Grouping"}]\n\`\`\`

    7.  **Variable Assignments:**
        *   **Example:** x = 4, y = 5
        *   **Response:** \`\`\`json\n[{"expr": "x", "result": "4", "assign": true, "problem_type": "algebra"}, {"expr": "y", "result": "5", "assign": true, "problem_type": "algebra"}]\n\`\`\`

    8.  **Graphical Math Problems:**
        *   These are word problems represented visually (e.g., physics problems, geometry, data interpretation from charts, etc.).
        *   Pay close attention to all visual cues, including colors and labels.
        *   **Response:** \`\`\`json\n[{"expr": "description of the problem", "result": "calculated_answer", "assign": false, "problem_type": "geometry", "steps": [{"description": "identify given information", "expression": "..."}, {"description": "apply relevant formula", "expression": "..."}, {"description": "solve", "expression": "..."}], "method": "Applied Mathematics"}]\n\`\`\`

    9.  **Abstract Concepts:**
        *   The image may depict abstract concepts (e.g., love, hate, a historical event).
        *   **Response:** \`\`\`json\n[{"expr": "explanation of the drawing", "result": "the abstract concept", "assign": false, "problem_type": "other"}]\n\`\`\`

    **Important Notes:**
    - For calculus problems, always show the specific rules used (power rule, chain rule, product rule, etc.)
    - For algebraic manipulations, show each transformation step clearly
    - For multi-step problems, break down the solution into logical, educational steps
    - Include the mathematical method or technique used in the "method" field
    - Classify problems correctly using "problem_type"

    Analyze the image and provide your solution as a JSON-formatted list of dictionaries, following the enhanced guidelines above with detailed step-by-step explanations.
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
      // More robust JSON extraction
      let jsonString = res.replace(/```json\n?|```/g, '').trim();
      
      // Handle cases where response might have extra text before/after JSON
      const jsonStart = jsonString.indexOf('[');
      const jsonEnd = jsonString.lastIndexOf(']') + 1;
      
      if (jsonStart !== -1 && jsonEnd > jsonStart) {
        jsonString = jsonString.substring(jsonStart, jsonEnd);
      }
      
      // Clean up the JSON string
      jsonString = jsonString.replace(/'/g, '"');
      
      // Fix common JSON formatting issues
      jsonString = jsonString.replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      jsonString = jsonString.replace(/([{,]\s*)(\w+):/g, '$1"$2":'); // Quote unquoted keys
      
      answers = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse JSON:", parseError, "Response from Gemini:", res);
      // Try to extract just the mathematical result if JSON parsing fails
      answers = [{
        expr: "Math Expression",
        result: "Unable to parse response",
        assign: false,
        problem_type: "other",
        steps: [],
        method: "Error Recovery"
      }];
    }

    // Ensure all answers have the required fields with defaults
    answers.forEach(answer => {
      answer.assign = answer.assign || false;
      answer.problem_type = answer.problem_type || 'other';
      answer.steps = answer.steps || [];
      answer.method = answer.method || 'Direct Calculation';
    });
    
    return answers;

  } catch (error) {
    console.error("Error calling Gemini API:", error, "Error Details:", error.details);
    return [];
  }
}

module.exports = { analyzeImage };
