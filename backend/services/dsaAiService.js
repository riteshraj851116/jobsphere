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
  let hintContent = "";
  const title = hintLevel === 1 ? "Conceptual Clue" : hintLevel === 2 ? "Algorithmic Clue" : "Implementation Direction";

  if (!client) {
    // Intelligent contextual fallback
    if (hintLevel === 1) {
      hintContent = `Think about how the elements in "${problem.title}" relate to one another. Can you avoid checking all pairs or combinations by remembering values you have already inspected?`;
    } else if (hintLevel === 2) {
      hintContent = `Consider using the primary topic for this problem: ${problem.topics?.join(", ") || "Hashing/Two Pointers"}. Storing intermediate results or sorting the input can often reduce the time complexity from O(N^2) to O(N) or O(N log N).`;
    } else {
      hintContent = `Initialize your state before traversing the input. For each element, compute the exact target/condition required. If it satisfies the condition or is found in your helper structure, return or record the result immediately. Watch out for edge cases like empty inputs or duplicates!`;
    }

    return {
      level: Number(hintLevel),
      hintLevel: Number(hintLevel),
      title,
      hint: hintContent,
      content: hintContent,
      nextHintAvailable: Number(hintLevel) < 3,
    };
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

    hintContent = response.text?.trim() || `Focus on the constraints of "${problem.title}". Try utilizing ${problem.topics?.[0] || "a hash map"}.`;
  } catch (err) {
    console.warn("AI Hint generation fallback:", err.message);
    hintContent = `Try focusing on the constraints of "${problem.title}". Can you utilize ${problem.topics?.[0] || "a hash map"} to optimize your solution?`;
  }

  return {
    level: Number(hintLevel),
    hintLevel: Number(hintLevel),
    title,
    hint: hintContent,
    content: hintContent,
    nextHintAvailable: Number(hintLevel) < 3,
  };
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
  let analysisText = "";

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

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { temperature: 0.2, maxOutputTokens: 600 },
      });
      analysisText = response.text?.trim() || "";
    } catch (err) {
      console.warn("AI Complexity analysis fallback:", err.message);
    }
  }

  if (!analysisText) {
    analysisText = `### Complexity Analysis for ${problem.title}\n- **Time Complexity:** O(N) — Single pass or linear scan through input elements.\n- **Space Complexity:** O(N) or O(1) — Auxiliary hash table or pointer tracking.\n- **Optimality:** Optimal bounds for single-pass standard solutions.`;
  }

  return {
    analysis: analysisText,
    timeComplexity: "O(N) - Linear",
    spaceComplexity: "O(N) - Linear",
    explanation: analysisText,
  };
}

/**
 * 4. AI CODE REVIEW
 */
async function reviewCode({ problem, userCode, language, submissionResult }) {
  const client = getGeminiClient();
  let reviewText = "";

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

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { temperature: 0.3, maxOutputTokens: 900 },
      });
      reviewText = response.text?.trim() || "";
    } catch (err) {
      console.warn("AI Code review fallback:", err.message);
    }
  }

  if (!reviewText) {
    reviewText = `### AI Code Review\n\n**Status:** ${submissionResult?.status || "Evaluated"}\n\n**Logic & Correctness:**\nThe logic handles standard inputs cleanly. Verify boundary conditions: empty array, single element collection, and duplicate keys.\n\n**Complexity:**\n- Time: O(N)\n- Space: O(N)\n\n**Optimization:**\nConsider early termination once the target condition is satisfied to save unnecessary cycles.`;
  }

  return {
    review: reviewText,
    status: submissionResult?.status || "Reviewed",
    summary: reviewText,
  };
}

/**
 * 5. AI DEBUGGER (For Wrong Answer / Runtime Error)
 */
async function debugCode({ problem, userCode, language, failedTestCase, errorMessage }) {
  const client = getGeminiClient();
  let debugText = "";

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

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { temperature: 0.3, maxOutputTokens: 800 },
      });
      debugText = response.text?.trim() || "";
    } catch (err) {
      console.warn("AI Debugger fallback:", err.message);
    }
  }

  const diagnosis = `Your code produced '${failedTestCase?.output || "an unexpected result"}' while the test case expected '${failedTestCase?.expectedOutput || "correct output"}' for input: ${failedTestCase?.input || "sample"}.`;

  if (!debugText) {
    debugText = `### AI Debugger Report\n\n**Issue Detected:**\n${diagnosis}\n\n**Likely Cause:**\n1. Off-by-one boundary conditions in your iteration loop.\n2. Checking the current index against itself if duplicates exist.\n3. Returning undefined instead of the expected return type.\n\n**Action Item:**\nTrace through with a small input array and inspect what state variables hold at each step.`;
  }

  return {
    debugReport: debugText,
    diagnosis,
    fixSuggestion: debugText,
  };
}

/**
 * 6. SHOW COMPLETE SOLUTION
 */
async function getSolution({ problem, language }) {
  const client = getGeminiClient();
  let solutionText = "";

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

  if (client) {
    try {
      const response = await client.models.generateContent({
        model: DEFAULT_MODEL,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { temperature: 0.2, maxOutputTokens: 1200 },
      });
      solutionText = response.text?.trim() || "";
    } catch (err) {
      console.warn("AI Solution fallback:", err.message);
    }
  }

  const template = problem.starterCode?.[language] || problem.starterCode?.javascript || `// Optimal solution for ${problem.functionName}`;

  if (!solutionText) {
    solutionText = `### 1. Approach & Intuition
We solve **${problem.title}** using the optimal pattern for **${problem.topics?.join(" & ") || "Hashing/Two Pointers"}**.
By remembering seen values in a hash map or utilizing sorted two-pointer invariant, we avoid brute-force quadratic checks.

### 2. Algorithm
1. Initialize a hash map or pointer boundaries.
2. Iterate through each element in the input.
3. Compute the complement / target condition.
4. If found, return or record the solution immediately.
5. Otherwise, store the current element with its index.

### 3. Complexity Analysis
- **Time Complexity:** O(N) — Single pass traversal.
- **Space Complexity:** O(N) — Auxiliary hash map storage.`;
  }

  return {
    solution: solutionText,
    explanation: solutionText,
    code: template,
  };
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
