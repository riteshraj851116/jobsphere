import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Trophy,
  CheckCircle2,
  Clock,
  RotateCcw,
  LayoutDashboard,
  History,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Loader2,
  ArrowRight
} from "lucide-react";
import { getInterviewSession } from "../../services/interviewService";
import "./Interview.css";

const InterviewResult = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchResult = async () => {
      try {
        setLoading(true);

        // Check offline and completed cached sessions first
        const localCached =
          localStorage.getItem(`interview_result_${sessionId}`) ||
          sessionStorage.getItem(`interview_session_${sessionId}`) ||
          localStorage.getItem(`interview_session_${sessionId}`);
        if (localCached && isMounted) {
          try {
            const parsed = JSON.parse(localCached);
            if (parsed.status === "completed" || sessionId?.startsWith("offline-") || sessionId?.startsWith("mock-")) {
              setSession(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {
            console.warn("Error parsing cached result:", e);
          }
        }

        const res = await getInterviewSession(sessionId);
        const data = res?.data || res?.session || res;

        if (isMounted && data) {
          setSession(data);
        }
      } catch (err) {
        console.error("Failed to fetch interview result:", err);
        const fallback =
          localStorage.getItem(`interview_result_${sessionId}`) ||
          sessionStorage.getItem(`interview_session_${sessionId}`) ||
          localStorage.getItem(`interview_session_${sessionId}`);
        if (fallback && isMounted) {
          try {
            setSession(JSON.parse(fallback));
          } catch (e) {
            setError("Failed to load interview results.");
          }
        } else if (isMounted) {
          setError(err?.message || "Failed to load interview results.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchResult();

    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  const formatDuration = (secs) => {
    if (!secs) return "00:00";
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins}m ${remainder}s`;
  };

  if (loading) {
    return (
      <div className="interview-page">
        <div className="interview-container" style={{ textAlign: "center", padding: "4rem 0" }}>
          <Loader2 size={36} style={{ margin: "0 auto 1rem", animation: "spin 1s linear infinite" }} />
          <h3>Calculating Interview Performance...</h3>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="interview-page">
        <div className="interview-container">
          <div className="review-card" style={{ textAlign: "center", padding: "3rem" }}>
            <AlertCircle size={48} color="#dc2626" style={{ margin: "0 auto 1rem" }} />
            <h2>Interview Result Not Found</h2>
            <p style={{ color: "#71717a", margin: "1rem 0" }}>{error || "Unable to load results."}</p>
            <Link to="/interview-practice" className="btn-session primary">
              Back to Practice Setup
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const questions = (session.questions || []).map((q, idx) => {
    const raw = q.questionId && typeof q.questionId === "object" ? q.questionId : q;
    return {
      ...raw,
      _id: raw._id || raw.id || `q-${idx}`,
      id: raw.id || raw._id || `q-${idx}`,
      question: raw.question || raw.text || raw.title || `Interview Question ${idx + 1}`,
      category: raw.category || session.role || "Technical",
      expectedAnswer: raw.expectedAnswer || raw.sampleAnswer || raw.explanation || "",
      sampleAnswer: raw.sampleAnswer || raw.expectedAnswer || raw.explanation || "",
      explanation: raw.explanation || ""
    };
  });
  const answersList = session.answers || [];

  const answersMap = {};
  answersList.forEach((a) => {
    const qId = a.questionId?._id || a.questionId;
    if (qId) {
      answersMap[qId] = a;
    }
  });

  const totalQuestions = session.totalQuestions || questions.length || 0;
  const answeredCount = answersList.filter(
    (a) => !a.skipped && a.answer && a.answer.trim().length > 0
  ).length;
  const skippedCount = answersList.filter((a) => a.skipped).length;
  const unansweredCount = Math.max(0, totalQuestions - answeredCount - skippedCount);

  const completionPercentage = totalQuestions > 0
    ? Math.round((answeredCount / totalQuestions) * 100)
    : 0;

  return (
    <div className="interview-page">
      <div className="interview-container">
        {/* Hero Card */}
        <div className="result-hero">
          <div className="result-trophy-icon">
            <Trophy size={32} />
          </div>

          <h1 className="result-title">Interview Practice Completed!</h1>
          <p className="result-meta">
            Target Role: <strong>{session.role}</strong> &bull; Difficulty:{" "}
            <span style={{ textTransform: "capitalize" }}>{session.difficulty}</span> &bull; Completed on{" "}
            {new Date(session.completedAt || session.updatedAt || session.startedAt || Date.now()).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })}
          </p>

          {/* Metric Cards Grid */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-val blue">{completionPercentage}%</div>
              <div className="metric-label">Completion</div>
            </div>

            <div className="metric-card">
              <div className="metric-val">{totalQuestions}</div>
              <div className="metric-label">Total Questions</div>
            </div>

            <div className="metric-card">
              <div className="metric-val green">{answeredCount}</div>
              <div className="metric-label">Answered</div>
            </div>

            <div className="metric-card">
              <div className="metric-val amber">{skippedCount}</div>
              <div className="metric-label">Skipped</div>
            </div>

            <div className="metric-card">
              <div className="metric-val">{formatDuration(session.duration)}</div>
              <div className="metric-label">Time Taken</div>
            </div>
          </div>

          {/* Quick Action Navigation */}
          <div className="result-action-buttons">
            <Link to="/interview-practice" className="btn-session primary">
              <RotateCcw size={16} />
              <span>Practice Again</span>
            </Link>

            <Link to="/interview-practice/history" className="btn-session secondary">
              <History size={16} />
              <span>View Past Interviews</span>
            </Link>

            <Link to="/dashboard" className="btn-session secondary">
              <LayoutDashboard size={16} />
              <span>Go to Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Detailed Question-by-Question Breakdown */}
        <div className="breakdown-header">
          <span>Question-by-Question Review</span>
          <span style={{ fontSize: "0.875rem", fontWeight: "500", color: "#71717a" }}>
            {questions.length} Items
          </span>
        </div>

        {questions.map((q, idx) => {
          const qId = q._id || q.id;
          const userAnsObj = answersMap[qId];
          const isSkipped = userAnsObj?.skipped;
          const userAnswer = userAnsObj?.answer;
          const hasAnswer = !isSkipped && userAnswer && userAnswer.trim().length > 0;

          return (
            <div key={qId || idx} className="review-card">
              <div className="review-top">
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "26px",
                      height: "26px",
                      borderRadius: "50%",
                      background: "#f3f4f6",
                      fontSize: "0.8125rem",
                      fontWeight: "700"
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span className="category-tag">
                    <Sparkles size={12} />
                    <span>{q.category || "Technical"}</span>
                  </span>
                </div>

                <div>
                  {hasAnswer && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        background: "#f0fdf4",
                        color: "#16a34a",
                        border: "1px solid #bbf7d0",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "700"
                      }}
                    >
                      <CheckCircle2 size={12} /> Answered
                    </span>
                  )}
                  {isSkipped && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        background: "#fffbeb",
                        color: "#d97706",
                        border: "1px solid #fde68a",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "700"
                      }}
                    >
                      Skipped
                    </span>
                  )}
                  {!hasAnswer && !isSkipped && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "3px 8px",
                        background: "#f3f4f6",
                        color: "#71717a",
                        border: "1px solid #e4e4e7",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: "700"
                      }}
                    >
                      Unanswered
                    </span>
                  )}
                </div>
              </div>

              <h3 className="review-q-title">{q.question || q.text || q.title}</h3>

              {/* User Answer */}
              <div style={{ marginBottom: "0.4rem", fontSize: "0.8125rem", fontWeight: "700", color: "#52525b" }}>
                YOUR SUBMITTED ANSWER:
              </div>
              <div className={`review-user-answer ${isSkipped ? "skipped" : ""}`}>
                {hasAnswer ? userAnswer : isSkipped ? "Question was skipped during the interview." : "No answer submitted."}
              </div>

              {/* Expected Model Answer */}
              {(q.expectedAnswer || q.sampleAnswer) && (
                <div className="review-expected-box">
                  <div className="review-expected-header">Model Answer / Key Concepts</div>
                  <div className="review-expected-text">{q.expectedAnswer || q.sampleAnswer}</div>

                  {q.explanation && (
                    <div className="review-explanation">
                      <strong>Pro-tip / Best Practice: </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Bottom CTA */}
        <div style={{ textAlign: "center", marginTop: "2rem" }}>
          <Link to="/interview-practice" className="btn-session primary">
            <span>Start Another Practice Interview</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InterviewResult;
