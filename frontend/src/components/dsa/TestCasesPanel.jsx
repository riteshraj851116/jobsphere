import React, { useState } from "react";
import { CheckCircle2, XCircle, Clock, AlertTriangle, Sparkles, Terminal } from "lucide-react";

const TestCasesPanel = ({
  sampleTestCases = [],
  executionResult = null,
  isExecuting = false,
  activeTab = "testcases",
  setActiveTab,
  onAskAiDebug,
}) => {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);

  const getStatusBadge = (status) => {
    switch (status) {
      case "Accepted":
        return (
          <span style={{ color: "#222222", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 700 }}>
            <CheckCircle2 size={16} /> Accepted
          </span>
        );
      case "Wrong Answer":
        return (
          <span style={{ color: "#222222", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 700 }}>
            <XCircle size={16} /> Wrong Answer
          </span>
        );
      case "Time Limit Exceeded":
        return (
          <span style={{ color: "#333333", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 700 }}>
            <Clock size={16} /> Time Limit Exceeded
          </span>
        );
      default:
        return (
          <span style={{ color: "#222222", display: "inline-flex", alignItems: "center", gap: "0.3rem", fontWeight: 700 }}>
            <AlertTriangle size={16} /> {status || "Runtime Error"}
          </span>
        );
    }
  };

  return (
    <div className="workspace-console">
      {/* Console Tab Bar */}
      <div className="console-header">
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            type="button"
            className={`testcase-pill ${activeTab === "testcases" ? "active" : ""}`}
            onClick={() => setActiveTab("testcases")}
          >
            <Terminal size={13} style={{ marginRight: 4 }} />
            Test Cases
          </button>

          <button
            type="button"
            className={`testcase-pill ${activeTab === "results" ? "active" : ""}`}
            onClick={() => setActiveTab("results")}
          >
            Test Result
            {executionResult && (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  marginLeft: 6,
                  display: "inline-block",
                  background: executionResult.status === "Accepted" ? "#222222" : "#222222",
                }}
              />
            )}
          </button>
        </div>

        {executionResult && (
          <div style={{ fontSize: "0.75rem", color: "var(--dsa-text-muted)" }}>
            Runtime: <strong style={{ color: "#f0f6fc" }}>{executionResult.runtime || 0} ms</strong> | Memory:{" "}
            <strong style={{ color: "#f0f6fc" }}>{executionResult.memory ? `${executionResult.memory} KB` : "N/A"}</strong>
          </div>
        )}
      </div>

      {/* Console Body */}
      <div className="console-body">
        {isExecuting ? (
          <div style={{ textAlign: "center", padding: "2rem", color: "var(--dsa-text-secondary)" }}>
            <div className="loading-spinner" style={{ margin: "0 auto 1rem" }} />
            <p>Running code in sandbox against test cases...</p>
          </div>
        ) : activeTab === "testcases" ? (
          <div>
            {/* Case selector tabs */}
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.85rem" }}>
              {sampleTestCases.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`testcase-pill ${selectedCaseIndex === idx ? "active" : ""}`}
                  onClick={() => setSelectedCaseIndex(idx)}
                >
                  Case {idx + 1}
                </button>
              ))}
            </div>

            {sampleTestCases[selectedCaseIndex] && (
              <div>
                <div className="test-field-label">Input</div>
                <div className="test-field-box">
                  {sampleTestCases[selectedCaseIndex].input}
                </div>

                <div className="test-field-label">Expected Output</div>
                <div className="test-field-box">
                  {sampleTestCases[selectedCaseIndex].expectedOutput}
                </div>

                {sampleTestCases[selectedCaseIndex].explanation && (
                  <div style={{ fontSize: "0.8rem", color: "var(--dsa-text-muted)" }}>
                    <strong>Note:</strong> {sampleTestCases[selectedCaseIndex].explanation}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          /* Results Tab */
          <div>
            {!executionResult ? (
              <div style={{ textAlign: "center", padding: "1.5rem", color: "var(--dsa-text-muted)" }}>
                You must run or submit your code to see execution results here.
              </div>
            ) : (
              <div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1rem",
                  }}
                >
                  <div>
                    <h3 style={{ margin: "0 0 0.25rem" }}>{getStatusBadge(executionResult.status)}</h3>
                    <span style={{ fontSize: "0.8rem", color: "var(--dsa-text-secondary)" }}>
                      Passed {executionResult.passedCount || 0} of {executionResult.totalTestCases || 0} test cases
                    </span>
                  </div>

                  {executionResult.status !== "Accepted" && onAskAiDebug && (
                    <button
                      type="button"
                      className="btn-workspace-ai"
                      onClick={() => onAskAiDebug(executionResult)}
                    >
                      <Sparkles size={14} />
                      Ask AI Coach to Debug
                    </button>
                  )}
                </div>

                {/* Failing Test Case Details */}
                {executionResult.failedTestCase && (
                  <div style={{ background: "rgba(0, 0, 0, 0.08)", border: "1px solid rgba(0, 0, 0, 0.25)", borderRadius: "8px", padding: "0.85rem", marginBottom: "0.85rem" }}>
                    <div style={{ fontWeight: 600, color: "#666666", fontSize: "0.8rem", marginBottom: "0.5rem" }}>
                      Failed Case #{executionResult.failedTestCase.index || 1}:
                    </div>

                    <div className="test-field-label">Input</div>
                    <div className="test-field-box">{executionResult.failedTestCase.input}</div>

                    <div className="test-field-label">Expected Output</div>
                    <div className="test-field-box">{executionResult.failedTestCase.expectedOutput}</div>

                    <div className="test-field-label">Your Output</div>
                    <div className="test-field-box" style={{ color: "#666666" }}>
                      {executionResult.failedTestCase.actualOutput || "None"}
                    </div>
                  </div>
                )}

                {/* Error Message Stack */}
                {executionResult.errorMessage && (
                  <div>
                    <div className="test-field-label">Error Details</div>
                    <pre
                      style={{
                        background: "rgba(15, 20, 28, 0.9)",
                        color: "#222222",
                        padding: "0.75rem",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        overflowX: "auto",
                        border: "1px solid rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {executionResult.errorMessage}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestCasesPanel;
