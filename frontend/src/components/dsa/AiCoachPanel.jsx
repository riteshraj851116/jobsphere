import React, { useState } from "react";
import {
  Sparkles,
  Lightbulb,
  BookOpen,
  Cpu,
  Code2,
  Bug,
  CheckCircle,
  X,
  Copy,
  Check,
} from "lucide-react";
import dsaService from "../../services/dsaService";

const AiCoachPanel = ({
  isOpen,
  onClose,
  problem,
  userCode,
  language,
  executionResult,
}) => {
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      title: "AI DSA Coach Ready",
      content: `Hello! I'm your JobSphere AI DSA Coach. I can provide progressive hints without giving away the full answer, explain the problem in simple terms, analyze your code's time/space complexity, or debug errors. Choose an action below to get started!`,
    },
  ]);
  const [loadingAction, setLoadingAction] = useState(null);
  const [hintLevel, setHintLevel] = useState(1);
  const [copiedId, setCopiedId] = useState(null);

  if (!isOpen) return null;

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAction = async (actionType) => {
    setLoadingAction(actionType);
    try {
      let res;
      let title = "";
      let content = "";

      if (actionType === "hint") {
        res = await dsaService.askAiCoach("hint", {
          problemId: problem._id,
          userCode,
          language,
          hintLevel,
        });
        if (res.success && res.data) {
          const lvl = res.data.level || res.data.hintLevel || hintLevel;
          const hintTitle = res.data.title || `Level ${lvl} Hint`;
          const hintBody = res.data.hint || res.data.content || "Analyze the problem constraints and look for an optimal lookup pattern.";
          title = `Hint Level ${lvl}: ${hintTitle}`;
          content = `${hintBody}\n\n*Pro-tip: ${lvl < 3 ? "Click Hint again for the next level!" : "You've unlocked the highest hint level!"}*`;
          setHintLevel((prev) => (prev >= 3 ? 1 : prev + 1));
        }
      } else if (actionType === "explain") {
        res = await dsaService.askAiCoach("explain", {
          problemId: problem._id,
        });
        if (res.success && res.data) {
          title = `Plain English Explanation: ${problem.title}`;
          content = res.data.explanation || res.data.content || "Here is the conceptual breakdown of the problem.";
        }
      } else if (actionType === "complexity") {
        res = await dsaService.askAiCoach("complexity", {
          problemId: problem._id,
          userCode,
          language,
        });
        if (res.success && res.data) {
          title = "Complexity Analysis";
          if (res.data.analysis) {
            content = res.data.analysis;
          } else {
            content = `**Time Complexity:** ${res.data.timeComplexity || "O(N)"}\n**Space Complexity:** ${res.data.spaceComplexity || "O(N)"}\n\n${res.data.explanation || "Analyzed based on algorithm loops and state storage."}`;
          }
        }
      } else if (actionType === "review") {
        res = await dsaService.askAiCoach("review", {
          problemId: problem._id,
          userCode,
          language,
          submissionResult: executionResult,
        });
        if (res.success && res.data) {
          title = "Code Quality & Edge-Case Review";
          content = res.data.review || res.data.summary || "Your code logic is structured well. Review boundary cases.";
        }
      } else if (actionType === "debug") {
        res = await dsaService.askAiCoach("debug", {
          problemId: problem._id,
          userCode,
          language,
          failedTestCase: executionResult?.failedTestCase,
          errorMessage: executionResult?.errorMessage,
        });
        if (res.success && res.data) {
          title = "Bug & Logic Diagnosis";
          if (res.data.debugReport) {
            content = res.data.debugReport;
          } else {
            content = `**Diagnosis:** ${res.data.diagnosis || "Output mismatch detected."}\n\n**Suggestion:**\n${res.data.fixSuggestion || "Trace loop boundaries."}`;
          }
        }
      } else if (actionType === "solution") {
        res = await dsaService.askAiCoach("solution", {
          problemId: problem._id,
          language,
        });
        if (res.success && res.data) {
          title = `Optimal Solution (${language})`;
          if (res.data.solution) {
            content = res.data.solution;
          } else {
            content = `${res.data.explanation || "Optimal solution:"}\n\n\`\`\`${language}\n${res.data.code || "// Solution"}\n\`\`\``;
          }
        }
      }

      if (title && content) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            title,
            content,
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          title: "AI Coach Notice",
          content:
            err.response?.data?.message ||
            "The AI coach is currently processing multiple requests. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="ai-coach-drawer">
      {/* Header */}
      <div className="ai-coach-header">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              background: "var(--dsa-ai-gradient)",
              padding: "0.35rem",
              borderRadius: "8px",
              display: "flex",
            }}
          >
            <Sparkles size={16} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: "0.95rem", color: "#fff" }}>
              AI DSA Coach
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--dsa-text-secondary)" }}>
              Interactive Guidance & Debugging
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="editor-tool-btn"
          title="Close AI Coach"
        >
          <X size={16} />
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="ai-coach-actions-grid">
        <button
          type="button"
          className="ai-quick-btn"
          disabled={loadingAction !== null}
          onClick={() => handleAction("hint")}
        >
          <Lightbulb size={14} color="#f59e0b" />
          <span>{loadingAction === "hint" ? "Thinking..." : `Hint (Lvl ${hintLevel})`}</span>
        </button>

        <button
          type="button"
          className="ai-quick-btn"
          disabled={loadingAction !== null}
          onClick={() => handleAction("explain")}
        >
          <BookOpen size={14} color="#3b82f6" />
          <span>{loadingAction === "explain" ? "Thinking..." : "Explain Simply"}</span>
        </button>

        <button
          type="button"
          className="ai-quick-btn"
          disabled={loadingAction !== null}
          onClick={() => handleAction("complexity")}
        >
          <Cpu size={14} color="#10b981" />
          <span>{loadingAction === "complexity" ? "Analyzing..." : "Analyze Complexity"}</span>
        </button>

        <button
          type="button"
          className="ai-quick-btn"
          disabled={loadingAction !== null}
          onClick={() => handleAction("review")}
        >
          <Code2 size={14} color="#8b5cf6" />
          <span>{loadingAction === "review" ? "Reviewing..." : "Review My Code"}</span>
        </button>

        <button
          type="button"
          className="ai-quick-btn"
          disabled={loadingAction !== null}
          onClick={() => handleAction("debug")}
        >
          <Bug size={14} color="#ef4444" />
          <span>{loadingAction === "debug" ? "Diagnosing..." : "Debug Code"}</span>
        </button>

        <button
          type="button"
          className="ai-quick-btn"
          disabled={loadingAction !== null}
          onClick={() => handleAction("solution")}
        >
          <CheckCircle size={14} color="#06b6d4" />
          <span>{loadingAction === "solution" ? "Fetching..." : "Optimal Solution"}</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="ai-coach-messages">
        {messages.map((m) => (
          <div key={m.id} className="ai-msg-bubble">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
                borderBottom: "1px solid var(--dsa-border-light)",
                paddingBottom: "0.35rem",
              }}
            >
              <strong style={{ color: "var(--dsa-accent)", fontSize: "0.85rem" }}>
                {m.title}
              </strong>

              <button
                type="button"
                className="editor-tool-btn"
                onClick={() => handleCopy(m.id, m.content)}
                title="Copy response"
              >
                {copiedId === m.id ? (
                  <Check size={13} color="#10b981" />
                ) : (
                  <Copy size={13} />
                )}
              </button>
            </div>

            <div
              style={{
                whiteSpace: "pre-wrap",
                fontSize: "0.85rem",
                lineHeight: "1.55",
                color: "var(--dsa-text-primary)",
              }}
            >
              {m.content}
            </div>
          </div>
        ))}

        {loadingAction && (
          <div className="ai-msg-bubble" style={{ textAlign: "center", padding: "1.5rem" }}>
            <div className="loading-spinner" style={{ margin: "0 auto 0.5rem" }} />
            <p style={{ margin: 0, fontSize: "0.825rem", color: "var(--dsa-text-secondary)" }}>
              JobSphere AI is analyzing your code and requirements...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiCoachPanel;
