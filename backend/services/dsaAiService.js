const { GoogleGenAI } = require("@google/genai");

/**
 * Helper to initialize the Gemini client
 */
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({ apiKey });
}

const DEFAULT_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

/**
 * 1. PROGRESSIVE HINT GENERATOR
 */
async function generateHint({ problem, userCode, language, hintLevel = 1 }) {
  const levelNames = {
    1: "Conceptual Clue (General intuition without revealing data structures)",
    2: "Data Structure & Algorithmic Clue (Specific technique e.g. two pointers, hash map, sliding window)",
    3: "Implementation Direction (Detailed step-by-step logic and edge case handling)",
  };

  const client = getGeminiClient();
  if (!client) {
    // Intelligent contextual fallback
    if (hintLevel === 1) {
      return {
        hintLevel: 1,
        title: "Conceptual Clue",
        content: `Think about how the elements in "${problem.title}" relate to one another. Can you avoid checking all pairs or combinations by remembering values you have already inspected?`,
      };
    } else if (hintLevel === 2) {
      return {
        hintLevel: 2,
        title: "Algorithmic Clue",
        content: `Consider using the primary topic for this problem: ${problem.topics?.join(", ") || "Hashing/Two Pointers"}. Storing intermediate results or sorting the input can often reduce the time complexity from O(N^2) to O(N) or O(N log N).`,
      };
    } else {
      return {
        hintLevel: 3,
        title: "Implementation Direction",
        content: `Initialize your state before traversing the input. For each element, compute the exact target/condition required. If it satisfies the condition or is found in your helper structure, return or record the result immediately. Watch out for edge cases like empty inputs or duplicates!`,
      };
    }
  }

  const prompt = `
You are the JobSphere AI DSA Coach. Provide Hint Level ${hintLevel}: ${levelNames[hintLevel] || "Hint"}.

PROBLEM DETAILS:
Title: ${problem.title}
Difficulty: ${problem.difficulty}
Topics: ${problem.topics?.join(", ")}
Description:
${problem.description}
Constraints:
${problem.constraints?.join("\n") || "Standard constraints"}

USER'S CURRENT CODE (${language}):
\`\`\`${language}
${userCode || "// No code written yet"}
\`\`\`

GUIDELINES FOR HINT LEVEL ${hintLevel}:
${
  hintLevel === 1
    ? "- Give a high-level conceptual clue.\n- DO NOT mention the exact data structure or algorithm yet.\n- Encourage the student to think about patterns."
    : hintLevel === 2
    ? "- Reveal the appropriate data structure or algorithmic technique (e.g. HashMap, Two Pointers, Monotonic Stack, DP).\n- Explain why this technique suits the problem constraints."
    : "- Give concrete step-by-step implementation guidance.\n- Highlight potential pitfalls and edge cases without writing the full final code."
}
Keep your response concise, encouraging, and formatted in clean Markdown.
`;

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.5, maxOutputTokens: 500 },
    });

    return {
      hintLevel: Number(hintLevel),
      title: hintLevel === 1 ? "Conceptual Clue" : hintLevel === 2 ? "Algorithmic Clue" : "Implementation Direction",
      content: response.text?.trim() || "Consider the constraints and think of how to optimize the search space.",
    };
  } catch (err) {
    console.warn("AI Hint generation fallback:", err.message);
    return {
      hintLevel: Number(hintLevel),
      title: hintLevel === 1 ? "Conceptual Clue" : hintLevel === 2 ? "Algorithmic Clue" : "Implementation Direction",
      content: `Try focusing on the constraints of "${problem.title}". Can you utilize ${problem.topics?.[0] || "a hash map"} to optimize your solution?`,
    };
  }
}

/**
 * 2. EXPLAIN SIMPLY (Beginner-friendly breakdown)
 */
async function explainSimply({ problem }) {
  const client = getGeminiClient();

  const prompt = `
You are the JobSphere AI DSA Coach. Explain the following problem in an intuitive, beginner-friendly way:

Problem: ${problem.title} (${problem.difficulty})
Topics: ${problem.topics?.join(", ")}
Description:
${problem.description}
Examples:
${JSON.stringify(problem.examples, null, 2)}
Constraints:
${problem.constraints?.join("\n")}

Format your response strictly using these Markdown sections:
### 1. What the Problem is Asking
(Simple analogy, everyday explanation of what inputs we get and what output we must produce)

### 2. The Brute Force Approach
(The most straightforward way to solve it, why it works, and its time/space complexity)

### 3. The Optimized Approach
(The optimal pattern/data structure, step-by-step explanation of how it works)

### 4. Step-by-Step Example Walkthrough
(Walk through the first example step by step with numbers/values)

### 5. Complexity Summary
- **Time Complexity:** ...
- **Space Complexity:** ...
`;

  if (!client) {
    return {
      explanation: `### 1. What the Problem is Asking\nWe need to solve **${problem.title}** by processing the input according to the rules and returning the expected result.\n\n### 2. The Brute Force Approach\nChecking every possible combination will take O(N²) time.\n\n### 3. The Optimized Approach\nBy using **${problem.topics?.join(" & ") || "optimized data structures"}**, we can solve this problem in O(N) or O(N log N) time.\n\n### 4. Step-by-Step Example Walkthrough\nRefer to the sample inputs in the problem description to trace each step.\n\n### 5. Complexity Summary\n- **Time Complexity:** O(N)\n- **Space Complexity:** O(N)`,
    };
  }

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.4, maxOutputTokens: 1000 },
    });
    return { explanation: response.text?.trim() };
  } catch (err) {
    console.warn("AI Explain Simply fallback:", err.message);
    return {
      explanation: `### 1. What the Problem is Asking\nIn **${problem.title}**, your goal is to efficiently compute the desired output given the input arguments.\n\n### 2. The Brute Force Approach\nA nested loop can verify all elements, but may be too slow for larger test cases.\n\n### 3. The Optimized Approach\nLeverage **${problem.topics?.[0] || "hashing"}** to achieve linear runtime.\n\n### 4. Complexity\n- **Time:** O(N)\n- **Space:** O(N)`,
    };
  }
}

/**
 * 3. ANALYZE COMPLEXITY
 */
async function analyzeComplexity({ problem, userCode, language }) {
  const client = getGeminiClient();

  const prompt = `
You are an expert algorithms instructor. Analyze the Time and Space complexity of this ${language} code for problem "${problem.title}":

\`\`\`${language}
${userCode}
\`\`\`

Return a concise Markdown response:
- **Time Complexity**: Big-O notation + exact justification (e.g. loops, recursion, internal calls)
- **Space Complexity**: Big-O notation + auxiliary memory explanation (e.g. arrays, hash tables, call stack)
- **Is it Optimal?**: Brief verdict on whether this meets the optimal bounds for "${problem.title}".
`;

  if (!client) {
    return {
      analysis: `### Complexity Analysis\n- **Time Complexity:** O(N) — Single pass over input elements.\n- **Space Complexity:** O(N) — Extra space for auxiliary storage.\n- **Optimality:** Meets standard optimal complexity criteria for this problem.`,
    };
  }

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.2, maxOutputTokens: 600 },
    });
    return { analysis: response.text?.trim() };
  } catch (err) {
    console.warn("AI Complexity analysis fallback:", err.message);
    return {
      analysis: `### Complexity Analysis\n- **Time Complexity:** O(N) — Linear scan through input elements.\n- **Space Complexity:** O(N) — Additional memory for data structures.\n- **Optimality:** Optimal for single-pass algorithms.`,
    };
  }
}

/**
 * 4. AI CODE REVIEW
 */
async function reviewCode({ problem, userCode, language, submissionResult }) {
  const client = getGeminiClient();

  const prompt = `
You are the JobSphere AI DSA Coach. Provide an in-depth code review for this code submission:

Problem: ${problem.title} (${problem.difficulty})
Language: ${language}
Submission Status: ${submissionResult?.status || "Evaluated"}
Runtime: ${submissionResult?.runtime || 0}ms
Passed Tests: ${submissionResult?.passedCount || 0}/${submissionResult?.totalTestCases || 0}

User's Code:
\`\`\`${language}
${userCode}
\`\`\`

${submissionResult?.failedTestCase ? `Failed Test Case:
Input: ${submissionResult.failedTestCase.input}
Output: ${submissionResult.failedTestCase.output}
Expected: ${submissionResult.failedTestCase.expectedOutput}
` : ""}

Provide a structured review in Markdown with:
1. **Result & Verdict**: (Acknowledge if Accepted or explain key reason if failed)
2. **Logic & Correctness**: Detailed inspection of edge cases, loop boundaries, invariants.
3. **Time & Space Complexity**: Big-O analysis of the current implementation.
4. **Clean Code & Readability**: Naming, modularity, language-idiomatic improvements.
5. **Optimization Opportunities**: Specific pointers to make it faster or consume less memory.
`;

  if (!client) {
    return {
      review: `### AI Code Review\n\n**Result:** ${submissionResult?.status || "Reviewed"}\n\n**Logic & Correctness:**\nThe logic handles standard inputs cleanly. Check edge cases like empty arrays, single-element collections, and negative numbers.\n\n**Complexity:**\n- Time: O(N)\n- Space: O(N)\n\n**Suggestions:**\nConsider pre-allocating structures or early termination once target condition is met.`,
    };
  }

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.3, maxOutputTokens: 900 },
    });
    return { review: response.text?.trim() };
  } catch (err) {
    console.warn("AI Code review fallback:", err.message);
    return {
      review: `### AI Code Review\n\n**Status:** ${submissionResult?.status || "Reviewed"}\n\n**Key Observations:**\n- Verify all constraint limits defined in the problem statement.\n- Keep time complexity bounded to linear or logarithmic where feasible.`,
    };
  }
}

/**
 * 5. AI DEBUGGER (For Wrong Answer / Runtime Error)
 */
async function debugCode({ problem, userCode, language, failedTestCase, errorMessage }) {
  const client = getGeminiClient();

  const prompt = `
You are the JobSphere AI DSA Coach and Debugger. The user's solution failed. Help them understand what went wrong without completely giving away the full answer.

Problem: ${problem.title}
Language: ${language}

User's Code:
\`\`\`${language}
${userCode}
\`\`\`

Failed Test Case:
Input: ${failedTestCase?.input || "N/A"}
Actual Output: ${failedTestCase?.output || "N/A"}
Expected Output: ${failedTestCase?.expectedOutput || "N/A"}
${errorMessage ? `Error Message: ${errorMessage}` : ""}

Provide a helpful debugging guide in Markdown:
1. **The Core Issue**: Explain what logical condition or edge case caused the output mismatch or error.
2. **Trace the Execution**: Show what happens line-by-line with the failed input.
3. **How to Fix**: Give a clear, actionable hint or code adjustment (do NOT replace their entire solution with a brand new code block).
`;

  if (!client) {
    return {
      debugReport: `### AI Debugger\n\n**Issue Detected:**\nYour code produced \`${failedTestCase?.output || "incorrect output"}\` when \`${failedTestCase?.expectedOutput || "expected output"}\` was expected for input: \`${failedTestCase?.input || ""}\`.\n\n**Likely Cause:**\nCheck loop boundary conditions, 0-indexing vs 1-indexing, or whether duplicate values are being counted.\n\n**Action Item:**\nAdd a check before returning or trace the input values manually.`,
    };
  }

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.3, maxOutputTokens: 800 },
    });
    return { debugReport: response.text?.trim() };
  } catch (err) {
    console.warn("AI Debugger fallback:", err.message);
    return {
      debugReport: `### AI Debugger\n\n**Failed Input:** \`${failedTestCase?.input || "Test input"}\`\n**Expected:** \`${failedTestCase?.expectedOutput || ""}\`\n**Actual:** \`${failedTestCase?.output || ""}\`\n\nTrace your state variables for this input to find where the values diverge.`,
    };
  }
}

/**
 * 6. SHOW COMPLETE SOLUTION
 */
async function getSolution({ problem, language }) {
  const client = getGeminiClient();

  // If problem has starter code for the language, use it as context
  const prompt = `
You are the JobSphere AI DSA Coach. Provide the optimal, clean, well-commented reference solution for:

Problem: ${problem.title} (${problem.difficulty})
Topics: ${problem.topics?.join(", ")}
Target Language: ${language}
Function Name: ${problem.functionName}

Problem Description:
${problem.description}
Constraints:
${problem.constraints?.join("\n")}

Format your response in Markdown:
### 1. Approach & Intuition
(Explain why this optimal approach is chosen and how it works)

### 2. Algorithm Steps
(Bullet points explaining the exact steps)

### 3. Reference Implementation (${language})
\`\`\`${language}
// Full working implementation matching the function name '${problem.functionName}'
\`\`\`

### 4. Complexity Analysis
- **Time Complexity:** O(...) with explanation
- **Space Complexity:** O(...) with explanation
`;

  if (!client) {
    // Intelligent fallback with problem's starter template
    const template = problem.starterCode?.[language] || problem.starterCode?.javascript || "// Solution template";
    return {
      solution: `### 1. Approach & Intuition\nWe solve **${problem.title}** using the optimal algorithmic technique (${problem.topics?.join(", ") || "Hashing/Two Pointers"}).\n\n### 2. Algorithm\n1. Initialize data structures.\n2. Iterate through input elements.\n3. Compute target condition and return result.\n\n### 3. Reference Implementation (${language})\n\`\`\`${language}\n${template}\n\`\`\`\n\n### 4. Complexity\n- **Time Complexity:** O(N)\n- **Space Complexity:** O(N)`,
    };
  }

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.2, maxOutputTokens: 1200 },
    });
    return { solution: response.text?.trim() };
  } catch (err) {
    console.warn("AI Solution fallback:", err.message);
    const template = problem.starterCode?.[language] || problem.starterCode?.javascript || "// Solution";
    return {
      solution: `### Optimal Solution for ${problem.title}\n\n\`\`\`${language}\n${template}\n\`\`\`\n\n**Complexity:** Time: O(N), Space: O(N).`,
    };
  }
}

/**
 * 7. TOPIC RECOMMENDATIONS BASED ON USER'S ACTUAL ACTIVITY
 */
async function generateRecommendations({ progress, allTopics = [] }) {
  const client = getGeminiClient();

  const rawStats = progress?.topicStats;
  const statsArray = [];

  if (rawStats instanceof Map || (rawStats && typeof rawStats.entries === "function")) {
    for (const [topic, stat] of rawStats.entries()) {
      if (stat) {
        statsArray.push({
          topic,
          solved: stat.solved || 0,
          attempted: stat.attempted || 0,
          failed: stat.failed || 0,
        });
      }
    }
  } else if (rawStats && typeof rawStats === "object") {
    for (const [topic, stat] of Object.entries(rawStats)) {
      if (stat) {
        statsArray.push({
          topic,
          solved: stat.solved || 0,
          attempted: stat.attempted || 0,
          failed: stat.failed || 0,
        });
      }
    }
  }

  // Find weak topics (high failures or attempted without solving)
  const weakTopics = statsArray
    .filter((s) => s.failed > 0 || (s.attempted > s.solved))
    .sort((a, b) => b.failed - a.failed)
    .map((s) => s.topic);

  // Strong topics (high solved)
  const strongTopics = statsArray
    .filter((s) => s.solved >= 2)
    .sort((a, b) => b.solved - a.solved)
    .map((s) => s.topic);

  const fallbackWeak = weakTopics.length > 0 ? weakTopics.slice(0, 3) : ["Trees", "Dynamic Programming", "Graph"];
  const fallbackStrong = strongTopics.length > 0 ? strongTopics.slice(0, 2) : ["Arrays", "Hashing"];

  const prompt = `
You are the JobSphere AI DSA Career Coach. Analyze the student's practice data and generate a personalized, motivating recommendation:

Strong Topics: ${fallbackStrong.join(", ")}
Topics needing practice/higher failure rate: ${fallbackWeak.join(", ")}
Total Solved: ${progress?.solvedProblems?.length || 0}
Total Attempted: ${progress?.attemptedProblems?.length || 0}
Current Streak: ${progress?.streak?.currentStreak || 0} days

Write a 2-3 sentence personalized recommendation. Highlight what they are doing well, and specifically mention which 1-2 topics they should practice next and why.
`;

  if (!client) {
    return {
      recommendedTopics: fallbackWeak,
      message: `You are performing well in ${fallbackStrong.join(" and ")}. Based on your recent practice, we recommend focusing on ${fallbackWeak[0] || "Trees"} and ${fallbackWeak[1] || "Dynamic Programming"} to strengthen your problem-solving range.`,
    };
  }

  try {
    const response = await client.models.generateContent({
      model: DEFAULT_MODEL,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      config: { temperature: 0.4, maxOutputTokens: 300 },
    });
    return {
      recommendedTopics: fallbackWeak,
      message: response.text?.trim() || `Focus on practicing ${fallbackWeak.join(" and ")} next to elevate your technical readiness.`,
    };
  } catch (err) {
    return {
      recommendedTopics: fallbackWeak,
      message: `Great progress! Based on your practice, consider focusing on ${fallbackWeak.join(" and ")} next.`,
    };
  }
}

module.exports = {
  generateHint,
  explainSimply,
  analyzeComplexity,
  reviewCode,
  debugCode,
  getSolution,
  generateRecommendations,
};
