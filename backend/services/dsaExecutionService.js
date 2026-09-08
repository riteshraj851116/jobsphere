const axios = require("axios");

// Judge0 language IDs
const JUDGE0_LANGUAGE_IDS = {
  javascript: 93, // Node.js 18.15.0
  python: 100,    // Python 3.12.5
  java: 91,       // Java JDK 17.0.6
  cpp: 105,       // C++ GCC 14.1.0
};

const JUDGE0_BASE_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";
const TIMEOUT_MS = 5000; // 5 second timeout per execution

/**
 * Normalizes string outputs for accurate comparison
 */
function normalizeOutput(val) {
  if (val === undefined || val === null) return "";
  let str = String(val).trim();
  // Normalize JSON arrays/objects if valid JSON
  try {
    const parsed = JSON.parse(str);
    // Sort array if order doesn't strictly matter for non-ordered comparisons or keep as-is
    return JSON.stringify(parsed);
  } catch (e) {
    return str.replace(/\r\n/g, "\n").trim();
  }
}

/**
 * Compares actual output with expected output
 */
function areOutputsEqual(actual, expected) {
  const normActual = normalizeOutput(actual);
  const normExpected = normalizeOutput(expected);
  if (normActual === normExpected) return true;

  // Attempt fuzzy boolean or number equivalence
  if (normActual.toLowerCase() === normExpected.toLowerCase()) return true;

  // Attempt array element comparison regardless of formatting
  try {
    const a = JSON.parse(normActual);
    const b = JSON.parse(normExpected);
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return JSON.stringify(a) === JSON.stringify(b);
    }
  } catch (e) {
    // Non-JSON comparison
  }

  return false;
}

/**
 * Builds standalone test runner code for JavaScript
 */
function buildJavaScriptRunner(userCode, functionName, testCases) {
  const serializedTests = JSON.stringify(testCases);
  return `
${userCode}

(function runAllTests() {
  const tests = ${serializedTests};
  const results = [];
  const fn = typeof ${functionName} === 'function' ? ${functionName} : (typeof Solution === 'function' ? new Solution().${functionName} : null);

  if (!fn) {
    console.log(JSON.stringify({
      error: "Function '${functionName}' not found in submitted code.",
      results: []
    }));
    return;
  }

  for (let i = 0; i < tests.length; i++) {
    const tc = tests[i];
    let inputArgs;
    try {
      inputArgs = JSON.parse(tc.input);
      if (!Array.isArray(inputArgs)) {
        inputArgs = [inputArgs];
      }
    } catch (e) {
      inputArgs = [tc.input];
    }

    const start = Date.now();
    try {
      const output = fn(...inputArgs);
      const runtime = Date.now() - start;
      const actualStr = typeof output === 'object' ? JSON.stringify(output) : String(output);
      results.push({
        index: i + 1,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: actualStr,
        runtime: runtime,
        passed: false
      });
    } catch (err) {
      results.push({
        index: i + 1,
        input: tc.input,
        expected: tc.expectedOutput,
        actual: null,
        error: err.message || String(err),
        passed: false
      });
      break; // Stop after first runtime failure
    }
  }

  console.log("===TEST_RESULTS_START===");
  console.log(JSON.stringify(results));
  console.log("===TEST_RESULTS_END===");
})();
`;
}

/**
 * Builds standalone test runner code for Python
 */
function buildPythonRunner(userCode, functionName, testCases) {
  const serializedTests = JSON.stringify(testCases);
  return `
import sys
import json
import time

${userCode}

tests = json.loads('''${serializedTests}''')
results = []

# Find function
fn = None
if '${functionName}' in globals():
    fn = globals()['${functionName}']
elif 'Solution' in globals():
    sol = Solution()
    if hasattr(sol, '${functionName}'):
        fn = getattr(sol, '${functionName}')

if fn is None:
    print(json.dumps({"error": "Function '${functionName}' not found in submitted code.", "results": []}))
    sys.exit(0)

for idx, tc in enumerate(tests):
    raw_in = tc['input']
    try:
        args = json.loads(raw_in)
        if not isinstance(args, list):
            args = [args]
    except Exception:
        args = [raw_in]
    
    t0 = time.time()
    try:
        out = fn(*args)
        t_ms = int((time.time() - t0) * 1000)
        out_str = json.dumps(out) if isinstance(out, (list, dict, bool)) else str(out)
        results.append({
            "index": idx + 1,
            "input": raw_in,
            "expected": tc['expectedOutput'],
            "actual": out_str,
            "runtime": t_ms,
            "passed": False
        })
    except Exception as e:
        results.append({
            "index": idx + 1,
            "input": raw_in,
            "expected": tc['expectedOutput'],
            "actual": None,
            "error": str(e),
            "passed": False
        })
        break

print("===TEST_RESULTS_START===")
print(json.dumps(results))
print("===TEST_RESULTS_END===")
`;
}

/**
 * Executes code via Judge0 CE isolated sandbox
 */
async function executeViaJudge0(sourceCode, language) {
  const langId = JUDGE0_LANGUAGE_IDS[language];
  if (!langId) {
    throw new Error(`Unsupported programming language for execution: ${language}`);
  }

  const response = await axios.post(
    `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
    {
      source_code: sourceCode,
      language_id: langId,
      stdin: "",
      cpu_time_limit: 3.5, // 3.5 seconds
      wall_time_limit: 5.0,
      memory_limit: 128000, // 128MB
    },
    { timeout: 10000 }
  );

  return response.data;
}

/**
 * Safe local fallback execution for JavaScript in restricted worker environment
 */
async function executeJavaScriptLocally(userCode, functionName, testCases) {
  const vm = require("vm");
  const testResults = [];
  let totalRuntime = 0;

  // Isolate execution context with no access to process, require, or network
  const sandbox = {
    console: {
      log: () => {},
      warn: () => {},
      error: () => {},
    },
    Math,
    Date,
    Array,
    Object,
    String,
    Number,
    Boolean,
    Set,
    Map,
    parseInt,
    parseFloat,
    isNaN,
    isFinite,
  };

  const context = vm.createContext(sandbox);

  try {
    // Compile and run user code inside sandboxed context with 1500ms timeout
    const script = new vm.Script(userCode);
    script.runInContext(context, { timeout: 1500 });
  } catch (compileErr) {
    return {
      status: "Compilation Error",
      errorMessage: compileErr.message,
      results: [],
      runtime: 0,
      memory: 0,
    };
  }

  const targetFn =
    typeof sandbox[functionName] === "function"
      ? sandbox[functionName]
      : sandbox.Solution && typeof sandbox.Solution.prototype?.[functionName] === "function"
      ? new sandbox.Solution()[functionName]
      : null;

  if (!targetFn) {
    return {
      status: "Compilation Error",
      errorMessage: `Function '${functionName}' was not defined. Please implement '${functionName}'.`,
      results: [],
      runtime: 0,
      memory: 0,
    };
  }

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    let args;
    try {
      args = JSON.parse(tc.input);
      if (!Array.isArray(args)) args = [args];
    } catch (e) {
      args = [tc.input];
    }

    const tStart = process.hrtime();
    try {
      const output = targetFn(...args);
      const tDiff = process.hrtime(tStart);
      const ms = Math.round(tDiff[0] * 1000 + tDiff[1] / 1e6);
      totalRuntime += ms;

      const actualStr = typeof output === "object" ? JSON.stringify(output) : String(output);
      const passed = areOutputsEqual(actualStr, tc.expectedOutput);

      testResults.push({
        index: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: actualStr,
        passed,
        runtime: ms,
        error: null,
      });

      if (!passed) {
        // Stop on first failure for judging efficiency
        break;
      }
    } catch (runErr) {
      testResults.push({
        index: i + 1,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        actualOutput: null,
        passed: false,
        runtime: 0,
        error: runErr.message || String(runErr),
      });
      break;
    }
  }

  const allPassed =
    testResults.length === testCases.length && testResults.every((t) => t.passed);
  const hasError = testResults.some((t) => t.error);

  let status = "Accepted";
  if (hasError) {
    status = "Runtime Error";
  } else if (!allPassed) {
    status = "Wrong Answer";
  }

  return {
    status,
    results: testResults,
    passedCount: testResults.filter((t) => t.passed).length,
    totalTestCases: testCases.length,
    runtime: totalRuntime,
    memory: Math.round(process.memoryUsage().heapUsed / 1024),
    errorMessage: hasError ? testResults.find((t) => t.error)?.error : null,
  };
}

/**
 * Main Code Execution & Judging Engine
 * @param {Object} options
 * @param {string} options.code - User submitted code
 * @param {string} options.language - 'javascript' | 'python' | 'java' | 'cpp'
 * @param {string} options.functionName - Name of method/function to invoke
 * @param {Array} options.testCases - Array of { input: string, expectedOutput: string }
 * @param {boolean} options.isSubmission - If true, executes against complete test suite
 */
async function executeCode({ code, language, functionName, testCases, isSubmission = false }) {
  if (!code || !code.trim()) {
    return {
      status: "Compilation Error",
      errorMessage: "No code provided to execute.",
      results: [],
      passedCount: 0,
      totalTestCases: testCases.length,
      runtime: 0,
      memory: 0,
    };
  }

  let fullCode = code;

  // Build language-specific test harness
  if (language === "javascript") {
    fullCode = buildJavaScriptRunner(code, functionName, testCases);
  } else if (language === "python") {
    fullCode = buildPythonRunner(code, functionName, testCases);
  } else if (language === "java" || language === "cpp") {
    // For Java & C++, user code can be run directly on Judge0
    fullCode = code;
  }

  try {
    // Attempt isolated execution through Judge0
    const judgeResult = await executeViaJudge0(fullCode, language);

    // Analyze Judge0 Status
    // Status IDs: 3 = Accepted, 4 = Wrong Answer, 5 = Time Limit Exceeded, 6 = Compilation Error, 7-12 = Runtime Error
    if (judgeResult.status?.id === 6 || judgeResult.compile_output) {
      return {
        status: "Compilation Error",
        errorMessage: judgeResult.compile_output || judgeResult.status?.description || "Compilation failed",
        results: [],
        passedCount: 0,
        totalTestCases: testCases.length,
        runtime: 0,
        memory: 0,
      };
    }

    if (judgeResult.status?.id === 5) {
      return {
        status: "Time Limit Exceeded",
        errorMessage: "Execution timed out (Time Limit Exceeded: 3.5s limit reached). Check for infinite loops or high algorithmic complexity.",
        results: [],
        passedCount: 0,
        totalTestCases: testCases.length,
        runtime: Math.round(parseFloat(judgeResult.time || "3.5") * 1000),
        memory: judgeResult.memory || 0,
      };
    }

    if (judgeResult.status?.id >= 7 && judgeResult.status?.id <= 12) {
      return {
        status: "Runtime Error",
        errorMessage: judgeResult.stderr || judgeResult.status?.description || "Runtime Exception",
        results: [],
        passedCount: 0,
        totalTestCases: testCases.length,
        runtime: Math.round(parseFloat(judgeResult.time || "0") * 1000),
        memory: judgeResult.memory || 0,
      };
    }

    // Extract test results from standard output delimited block
    const stdout = judgeResult.stdout || "";
    let extractedResults = [];

    if (stdout.includes("===TEST_RESULTS_START===")) {
      const parts = stdout.split("===TEST_RESULTS_START===")[1].split("===TEST_RESULTS_END===")[0];
      try {
        extractedResults = JSON.parse(parts.trim());
      } catch (parseErr) {
        console.warn("Could not parse test results JSON from Judge0 output:", parseErr.message);
      }
    }

    // Evaluate each test result against expected output
    const evaluatedResults = extractedResults.map((item) => {
      const passed = !item.error && areOutputsEqual(item.actual, item.expected);
      return {
        index: item.index,
        input: item.input,
        expectedOutput: item.expected,
        actualOutput: item.actual,
        passed,
        runtime: item.runtime || 0,
        error: item.error || null,
      };
    });

    const passedCount = evaluatedResults.filter((r) => r.passed).length;
    const hasError = evaluatedResults.some((r) => r.error);
    const allPassed = evaluatedResults.length === testCases.length && evaluatedResults.every((r) => r.passed);

    let finalStatus = "Accepted";
    if (hasError) {
      finalStatus = "Runtime Error";
    } else if (!allPassed) {
      finalStatus = "Wrong Answer";
    }

    const failedItem = evaluatedResults.find((r) => !r.passed);

    return {
      status: finalStatus,
      results: evaluatedResults,
      passedCount,
      totalTestCases: testCases.length,
      runtime: Math.round(parseFloat(judgeResult.time || "0") * 1000),
      memory: judgeResult.memory || 0,
      failedTestCase: failedItem
        ? {
            input: failedItem.input,
            output: failedItem.actualOutput || "",
            expectedOutput: failedItem.expectedOutput,
          }
        : null,
      errorMessage: hasError ? failedItem?.error : null,
    };
  } catch (judgeError) {
    console.warn("Judge0 external execution notice, utilizing safe sandbox fallback:", judgeError.message);

    // If JavaScript, run in local secure vm context
    if (language === "javascript") {
      return await executeJavaScriptLocally(code, functionName, testCases);
    }

    // If Judge0 is temporarily unreachable for Python/Java/C++
    return {
      status: "Runtime Error",
      errorMessage: `Sandboxed code execution service is temporarily busy: ${judgeError.message}. Please retry in a few seconds.`,
      results: [],
      passedCount: 0,
      totalTestCases: testCases.length,
      runtime: 0,
      memory: 0,
    };
  }
}

module.exports = {
  executeCode,
  areOutputsEqual,
  normalizeOutput,
};
