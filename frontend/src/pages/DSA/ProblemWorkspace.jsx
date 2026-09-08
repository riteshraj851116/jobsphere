import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Bookmark,
  Play,
  Send,
  Sparkles,
  FileText,
  History,
  Lightbulb,
  CheckCircle2,
  Award,
  ArrowRight,
  Flame,
} from "lucide-react";
import CodeEditor from "../../components/dsa/CodeEditor";
import TestCasesPanel from "../../components/dsa/TestCasesPanel";
import AiCoachPanel from "../../components/dsa/AiCoachPanel";
import SubmissionHistory from "../../components/dsa/SubmissionHistory";
import dsaService from "../../services/dsaService";
import { useAuth } from "../../hooks/useAuth";
import "./dsa.css";

const ProblemWorkspace = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Problem State
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Editor State
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");

  // Workspace Layout State
  const [leftTab, setLeftTab] = useState("description"); // "description" | "submissions" | "hints"
  const [consoleTab, setConsoleTab] = useState("testcases"); // "testcases" | "results"
  const [isAiCoachOpen, setIsAiCoachOpen] = useState(false);

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);

  // Celebration Modal
  const [showCelebration, setShowCelebration] = useState(false);
  const [submissionStats, setSubmissionStats] = useState(null);

  // Load problem details
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    dsaService
      .getProblem(idOrSlug)
      .then((res) => {
        if (isMounted && res.success) {
          const prob = res.data;
          setProblem(prob);

          // Check if user has draft saved in localStorage
          const draftKey = `dsa_draft_${prob._id}_${language}`;
          const savedCode = localStorage.getItem(draftKey);
          if (savedCode && savedCode.trim()) {
            setCode(savedCode);
          } else {
            setCode(prob.starterCode?.[language] || "");
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.response?.data?.message || "Failed to load problem");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [idOrSlug]);

  // When language changes, update code template or draft
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (problem) {
      const draftKey = `dsa_draft_${problem._id}_${newLang}`;
      const saved = localStorage.getItem(draftKey);
      if (saved && saved.trim()) {
        setCode(saved);
      } else {
        setCode(problem.starterCode?.[newLang] || "");
      }
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async () => {
    if (!user) {
      alert("Please log in to save bookmarks.");
      return;
    }
    if (!problem) return;

    try {
      const res = await dsaService.toggleBookmark(problem._id);
      if (res.success) {
        setProblem((prev) => ({
          ...prev,
          isBookmarked: res.isBookmarked,
        }));
      }
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
    }
  };

  // Run Code against Sample Test Cases
  const handleRunCode = async () => {
    if (!problem || !code.trim() || isRunning) return;

    setIsRunning(true);
    setConsoleTab("results");
    try {
      const res = await dsaService.runCode({
        problemId: problem._id,
        language,
        code,
      });

      if (res.success) {
        setExecutionResult(res.data);
      }
    } catch (err) {
      setExecutionResult({
        status: "Error",
        errorMessage: err.response?.data?.message || "Execution failed. Please check your syntax.",
        passedCount: 0,
        totalTestCases: problem.sampleTestCases?.length || 0,
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code against Hidden Test Suite
  const handleSubmitCode = async () => {
    if (!user) {
      alert("Please log in to submit your code and record your streak.");
      return;
    }
    if (!problem || !code.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setConsoleTab("results");
    try {
      const res = await dsaService.submitCode({
        problemId: problem._id,
        language,
        code,
      });

      if (res.success) {
        setExecutionResult(res.data);

        if (res.data.status === "Accepted") {
          setSubmissionStats(res.data);
          setShowCelebration(true);
          setProblem((prev) => ({
            ...prev,
            userStatus: "Solved",
          }));
        }
      }
    } catch (err) {
      setExecutionResult({
        status: "Error",
        errorMessage: err.response?.data?.message || "Submission failed. Check network or syntax.",
        passedCount: 0,
        totalTestCases: 0,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trigger AI to Debug from TestCasesPanel
  const handleAskAiDebug = (failedResult) => {
    setIsAiCoachOpen(true);
  };

  if (loading) {
    return (
      <div className="dsa-workspace" style={{ alignItems: "center", justifyContent: "center" }}>
        <div className="loading-spinner" style={{ width: 40, height: 40 }} />
        <p style={{ marginTop: "1rem", color: "var(--dsa-text-secondary)" }}>
          Setting up coding workspace...
        </p>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="dsa-workspace" style={{ alignItems: "center", justifyContent: "center" }}>
        <h3 style={{ color: "#ef4444" }}>Problem Not Found</h3>
        <p style={{ color: "var(--dsa-text-secondary)" }}>{error || "The requested problem could not be loaded."}</p>
        <Link to="/dsa/problems" className="daily-action-btn" style={{ marginTop: "1rem" }}>
          Back to Problems Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="dsa-workspace">
      {/* Top Bar */}
      <div className="workspace-topbar">
        <div className="workspace-title-section">
          <Link
            to="/dsa/problems"
            className="editor-tool-btn"
            title="Back to Problem List"
          >
            <ChevronLeft size={18} />
          </Link>

          <span style={{ fontWeight: 600, color: "var(--dsa-text-primary)", fontSize: "0.95rem" }}>
            {problem.problemNumber}. {problem.title}
          </span>

          <span
            className={
              problem.difficulty === "Easy"
                ? "dsa-badge-easy"
                : problem.difficulty === "Medium"
                ? "dsa-badge-medium"
                : "dsa-badge-hard"
            }
          >
            {problem.difficulty}
          </span>

          <button
            type="button"
            className="editor-tool-btn"
            onClick={handleToggleBookmark}
            title={problem.isBookmarked ? "Remove Bookmark" : "Bookmark Problem"}
          >
            <Bookmark
              size={15}
              color={problem.isBookmarked ? "#f59e0b" : "var(--dsa-text-muted)"}
              fill={problem.isBookmarked ? "#f59e0b" : "none"}
            />
          </button>
        </div>

        {/* Action Controls */}
        <div className="workspace-actions">
          <button
            type="button"
            className="btn-workspace-run"
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            title="Run code against sample test cases (Ctrl + Enter)"
          >
            <Play size={13} fill="currentColor" />
            <span>{isRunning ? "Running..." : "Run"}</span>
          </button>

          <button
            type="button"
            className="btn-workspace-submit"
            onClick={handleSubmitCode}
            disabled={isRunning || isSubmitting}
            title="Submit solution to hidden test suite (Ctrl + Shift + Enter)"
          >
            <Send size={13} fill="currentColor" />
            <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
          </button>

          <button
            type="button"
            className="btn-workspace-ai"
            onClick={() => setIsAiCoachOpen(!isAiCoachOpen)}
            title="Open AI DSA Coach"
          >
            <Sparkles size={14} />
            <span>AI Coach</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split Grid */}
      <div className="workspace-grid">
        {/* LEFT PANE: Description, Submissions, Hints */}
        <div className="workspace-left-pane">
          {/* Tabs */}
          <div className="workspace-tabs">
            <button
              type="button"
              className={`workspace-tab ${leftTab === "description" ? "active" : ""}`}
              onClick={() => setLeftTab("description")}
            >
              <FileText size={14} />
              <span>Description</span>
            </button>

            <button
              type="button"
              className={`workspace-tab ${leftTab === "submissions" ? "active" : ""}`}
              onClick={() => setLeftTab("submissions")}
            >
              <History size={14} />
              <span>Submissions</span>
            </button>

            <button
              type="button"
              className={`workspace-tab ${leftTab === "hints" ? "active" : ""}`}
              onClick={() => setLeftTab("hints")}
            >
              <Lightbulb size={14} />
              <span>Hints</span>
            </button>
          </div>

          {/* Left Pane Content Body */}
          <div className="workspace-pane-body">
            {leftTab === "description" && (
              <div className="problem-desc-markdown">
                <h1 style={{ fontSize: "1.4rem", margin: "0 0 0.5rem", color: "var(--dsa-text-primary)" }}>
                  {problem.problemNumber}. {problem.title}
                </h1>

                {/* Topics Tag Pills */}
                <div style={{ marginBottom: "1.25rem" }}>
                  {problem.topics?.map((t, idx) => (
                    <span key={idx} className="dsa-topic-pill">
                      {t}
                    </span>
                  ))}
                </div>

                {/* Problem Statement */}
                <div style={{ whiteSpace: "pre-line", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                  {problem.description}
                </div>

                {/* Examples */}
                <h3 style={{ fontSize: "1rem", color: "var(--dsa-text-primary)", marginBottom: "0.75rem" }}>Examples</h3>
                {problem.examples?.map((ex, idx) => (
                  <div key={idx} className="problem-example-card">
                    <div>
                      <strong style={{ color: "var(--dsa-accent)" }}>Example {idx + 1}:</strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--dsa-text-muted)" }}>Input: </span>
                      {ex.input}
                    </div>
                    <div>
                      <span style={{ color: "var(--dsa-text-muted)" }}>Output: </span>
                      <span style={{ color: "#10b981", fontWeight: 600 }}>{ex.output}</span>
                    </div>
                    {ex.explanation && (
                      <div style={{ color: "var(--dsa-text-secondary)", marginTop: "0.25rem" }}>
                        <span style={{ color: "var(--dsa-text-muted)" }}>Explanation: </span>
                        {ex.explanation}
                      </div>
                    )}
                  </div>
                ))}

                {/* Constraints */}
                {problem.constraints?.length > 0 && (
                  <div style={{ marginTop: "1.5rem" }}>
                    <h3 style={{ fontSize: "1rem", color: "var(--dsa-text-primary)", marginBottom: "0.5rem" }}>
                      Constraints
                    </h3>
                    <ul className="problem-constraints-list">
                      {problem.constraints.map((c, idx) => (
                        <li key={idx}>
                          <code>{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Follow up */}
                {problem.followUp && (
                  <div
                    style={{
                      marginTop: "1.5rem",
                      background: "var(--accent-light, #eff6ff)",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      padding: "0.85rem",
                      fontSize: "0.85rem",
                    }}
                  >
                    <strong style={{ color: "var(--dsa-accent)" }}>Follow up: </strong>
                    <span style={{ color: "var(--dsa-text-primary)" }}>{problem.followUp}</span>
                  </div>
                )}
              </div>
            )}

            {leftTab === "submissions" && (
              <SubmissionHistory
                problemId={problem._id}
                onSelectCode={(historicalCode, historicalLang) => {
                  setLanguage(historicalLang || language);
                  setCode(historicalCode);
                }}
              />
            )}

            {leftTab === "hints" && (
              <div>
                <h3 style={{ margin: "0 0 1rem", fontSize: "1.1rem", color: "var(--dsa-text-primary)" }}>
                  Problem Hints & Approach
                </h3>
                <p style={{ color: "var(--dsa-text-secondary)", fontSize: "0.85rem", lineHeight: 1.6 }}>
                  Try thinking about the time complexity requirements first. Can you trade auxiliary space for time?
                </p>

                <div
                  style={{
                    background: "var(--surface-soft, #f8fafc)",
                    border: "1px solid var(--dsa-border)",
                    borderRadius: "10px",
                    padding: "1rem",
                    marginTop: "1rem",
                  }}
                >
                  <h4 style={{ margin: "0 0 0.5rem", color: "var(--dsa-accent)", fontSize: "0.95rem" }}>
                    💡 Step-by-Step AI Coach Guidance
                  </h4>
                  <p style={{ color: "var(--dsa-text-secondary)", fontSize: "0.85rem" }}>
                    Need a nudge in the right direction without spoiling the complete answer? Open the AI Coach to receive progressive clues!
                  </p>
                  <button
                    type="button"
                    className="btn-workspace-ai"
                    onClick={() => setIsAiCoachOpen(true)}
                  >
                    <Sparkles size={14} />
                    Open AI Coach for Hints
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT PANE: Code Editor & Console/Test Cases */}
        <div className="workspace-right-pane">
          {/* Top Half: Monaco Code Editor */}
          <CodeEditor
            problemId={problem._id}
            language={language}
            onLanguageChange={handleLanguageChange}
            code={code}
            onCodeChange={setCode}
            starterCode={problem.starterCode}
            onRun={handleRunCode}
            onSubmit={handleSubmitCode}
            isRunning={isRunning}
            isSubmitting={isSubmitting}
          />

          {/* Bottom Half: Console / Test Cases & Execution Results */}
          <TestCasesPanel
            sampleTestCases={problem.sampleTestCases}
            executionResult={executionResult}
            isExecuting={isRunning || isSubmitting}
            activeTab={consoleTab}
            setActiveTab={setConsoleTab}
            onAskAiDebug={handleAskAiDebug}
          />
        </div>
      </div>

      {/* AI Coach Drawer Panel */}
      <AiCoachPanel
        isOpen={isAiCoachOpen}
        onClose={() => setIsAiCoachOpen(false)}
        problem={problem}
        userCode={code}
        language={language}
        executionResult={executionResult}
      />

      {/* Accepted Celebration Overlay Modal */}
      {showCelebration && (
        <div className="celebration-overlay" onClick={() => setShowCelebration(false)}>
          <div className="celebration-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ marginBottom: "1rem" }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "2px solid #10b981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto",
                }}
              >
                <CheckCircle2 size={36} color="#10b981" />
              </div>
            </div>

            <h2 style={{ color: "var(--dsa-text-primary)", margin: "0 0 0.5rem" }}>Accepted!</h2>
            <p style={{ color: "var(--dsa-text-secondary)", fontSize: "0.9rem", margin: "0 0 1.5rem" }}>
              All hidden test cases passed successfully. Great job!
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.75rem",
                background: "var(--surface-soft, #f8fafc)",
                border: "1px solid var(--dsa-border)",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div>
                <div style={{ color: "var(--dsa-text-muted)", fontSize: "0.75rem" }}>Runtime</div>
                <div style={{ color: "var(--dsa-text-primary)", fontWeight: 700 }}>
                  {submissionStats?.runtime || 0} ms
                </div>
              </div>
              <div>
                <div style={{ color: "var(--dsa-text-muted)", fontSize: "0.75rem" }}>Memory</div>
                <div style={{ color: "var(--dsa-text-primary)", fontWeight: 700 }}>
                  {submissionStats?.memory ? `${submissionStats.memory} KB` : "14.2 MB"}
                </div>
              </div>
              <div>
                <div style={{ color: "var(--dsa-text-muted)", fontSize: "0.75rem" }}>Streak</div>
                <div style={{ color: "#ff7849", fontWeight: 700 }}>Active 🔥</div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button
                type="button"
                className="dsa-page-btn"
                style={{ flex: 1, padding: "0.65rem" }}
                onClick={() => setShowCelebration(false)}
              >
                Stay Here
              </button>

              <button
                type="button"
                className="daily-action-btn"
                style={{ flex: 1, padding: "0.65rem" }}
                onClick={() => navigate("/dsa/problems")}
              >
                <span>Next Problem</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProblemWorkspace;
