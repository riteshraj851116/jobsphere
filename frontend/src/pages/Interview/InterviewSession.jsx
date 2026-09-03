import React, { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  CheckCircle2,
  AlertTriangle,
  Send,
  Loader2,
  Sparkles,
  Layers
} from "lucide-react";
import {
  getInterviewSession,
  saveInterviewAnswer,
  completeInterviewSession
} from "../../services/interviewService";
import "./Interview.css";

const InterviewSession = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answersMap, setAnswersMap] = useState({}); // { [questionId]: { answer: string, skipped: boolean } }
  const [currentText, setCurrentText] = useState("");
  const [saveStatus, setSaveStatus] = useState("saved"); // "saved" | "saving" | "unsaved"
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [error, setError] = useState(null);

  const debounceTimerRef = useRef(null);
  const timerIntervalRef = useRef(null);

  // Load Session
  useEffect(() => {
    let isMounted = true;

    const fetchSession = async () => {
      try {
        setLoading(true);
        const res = await getInterviewSession(sessionId);
        const data = res?.data || res?.session || res;

        if (!data || !data.questions) {
          throw new Error("Interview session data not found");
        }

        if (data.status === "completed") {
          navigate(`/interview-practice/result/${sessionId}`, { replace: true });
          return;
        }

        // Normalise questions — offline sessions nest question inside questionId
        const normalizedQuestions = data.questions.map((q) => {
          if (q.questionId && typeof q.questionId === "object") {
            return { ...q.questionId, _id: q.questionId._id || q._id };
          }
          return q;
        });

        const normalizedSession = { ...data, questions: normalizedQuestions };

        if (isMounted) {
          setSession(normalizedSession);

          // Populate answersMap
          const initialMap = {};
          if (Array.isArray(data.answers)) {
            data.answers.forEach((ans) => {
              const qId = ans.questionId?._id || ans.questionId;
              if (qId) {
                initialMap[qId] = {
                  answer: ans.answer || "",
                  skipped: !!ans.skipped
                };
              }
            });
          }
          setAnswersMap(initialMap);

          // Set initial duration from startedAt
          if (data.startedAt) {
            const elapsed = Math.floor(
              (Date.now() - new Date(data.startedAt).getTime()) / 1000
            );
            setDuration(Math.max(0, elapsed));
          }

          // Set active question answer
          const firstQ = normalizedQuestions[0];
          if (firstQ) {
            const firstQId = firstQ._id || firstQ.id;
            setCurrentText(initialMap[firstQId]?.answer || "");
          }
        }
      } catch (err) {
        console.error("Error loading interview session:", err);
        if (isMounted) {
          setError(err?.message || "Failed to load interview session.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchSession();

    return () => {
      isMounted = false;
    };
  }, [sessionId, navigate]);

  // Live Timer
  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  // Format Duration MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainderSecs = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${remainderSecs
      .toString()
      .padStart(2, "0")}`;
  };

  const currentQuestion = session?.questions?.[currentIndex] || null;
  const currentQuestionId = currentQuestion?._id || currentQuestion?.id;
  const totalQuestions = session?.questions?.length || 0;

  // Persist single answer to backend
  const persistAnswer = useCallback(
    async (qId, text, isSkipped = false) => {
      if (!qId || !sessionId) return;
      try {
        setSaveStatus("saving");
        await saveInterviewAnswer(sessionId, qId, text, isSkipped);
        setSaveStatus("saved");
      } catch (err) {
        console.error("Failed to persist answer:", err);
        setSaveStatus("unsaved");
      }
    },
    [sessionId]
  );

  // Handle textarea changes with debounce
  const handleTextChange = (e) => {
    const newText = e.target.value;
    setCurrentText(newText);
    setSaveStatus("unsaved");

    if (currentQuestionId) {
      setAnswersMap((prev) => ({
        ...prev,
        [currentQuestionId]: {
          answer: newText,
          skipped: false
        }
      }));

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        persistAnswer(currentQuestionId, newText, false);
      }, 1200);
    }
  };

  // Switch question helper
  const navigateToQuestion = async (newIndex) => {
    if (newIndex < 0 || newIndex >= totalQuestions) return;

    // Immediately flush pending autosave for current question
    if (currentQuestionId) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      await persistAnswer(currentQuestionId, currentText, false);
    }

    const nextQ = session.questions[newIndex];
    const nextQId = nextQ?._id || nextQ?.id;
    setCurrentIndex(newIndex);
    setCurrentText(answersMap[nextQId]?.answer || "");
  };

  // Handle Skip
  const handleSkip = async () => {
    if (!currentQuestionId) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setAnswersMap((prev) => ({
      ...prev,
      [currentQuestionId]: {
        answer: "",
        skipped: true
      }
    }));
    setCurrentText("");

    await persistAnswer(currentQuestionId, "", true);

    if (currentIndex < totalQuestions - 1) {
      navigateToQuestion(currentIndex + 1);
    }
  };

  // Handle End / Complete Interview
  const handleEndInterview = async () => {
    try {
      setSubmitting(true);
      // Flush current answer
      if (currentQuestionId) {
        await persistAnswer(currentQuestionId, currentText, false);
      }

      await completeInterviewSession(sessionId, duration);
      setShowEndModal(false);
      navigate(`/interview-practice/result/${sessionId}`);
    } catch (err) {
      console.error("Error completing interview:", err);
      setError(err?.message || "Failed to complete interview.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="interview-page">
        <div className="interview-container" style={{ textAlign: "center", padding: "4rem 0" }}>
          <Loader2 className="spinner" size={36} style={{ margin: "0 auto 1rem", animation: "spin 1s linear infinite" }} />
          <h3>Preparing Interview Environment...</h3>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="interview-page">
        <div className="interview-container">
          <div className="review-card" style={{ textAlign: "center", padding: "3rem" }}>
            <AlertTriangle size={48} color="#dc2626" style={{ margin: "0 auto 1rem" }} />
            <h2>Interview Session Not Found</h2>
            <p style={{ color: "#71717a", margin: "1rem 0" }}>{error || "Unable to load interview session."}</p>
            <button
              onClick={() => navigate("/interview-practice")}
              className="btn-session primary"
            >
              Back to Practice Setup
            </button>
          </div>
        </div>
      </div>
    );
  }

  const answeredCount = Object.values(answersMap).filter(
    (a) => !a.skipped && a.answer && a.answer.trim().length > 0
  ).length;

  const progressPercent = Math.round(
    ((currentIndex + 1) / totalQuestions) * 100
  );

  return (
    <div className="interview-page">
      <div className="session-container">
        {/* Top Session Info Bar */}
        <div className="session-topbar">
          <div className="session-meta-info">
            <span className="meta-chip role">
              <Layers size={14} />
              <span>{session.role}</span>
            </span>

            <span className={`meta-chip difficulty-${session.difficulty}`}>
              {session.difficulty.toUpperCase()}
            </span>
          </div>

          {/* Live Timer */}
          <div className="session-timer" title="Elapsed Time">
            <span className="timer-pulse" />
            <Clock size={15} />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="progress-card">
          <div className="progress-info-row">
            <span>
              Question <strong>{currentIndex + 1}</strong> of <strong>{totalQuestions}</strong>
            </span>
            <span>
              {answeredCount} of {totalQuestions} answered
            </span>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Active Question Card */}
        {currentQuestion && (
          <div className="question-card">
            <div className="question-header">
              <span className="category-tag">
                <Sparkles size={13} />
                <span>{currentQuestion.category || "General"}</span>
              </span>

              <div className={`save-status-pill ${saveStatus}`}>
                {saveStatus === "saving" && (
                  <>
                    <Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} />
                    <span>Saving answer...</span>
                  </>
                )}
                {saveStatus === "saved" && (
                  <>
                    <CheckCircle2 size={13} />
                    <span>Saved</span>
                  </>
                )}
                {saveStatus === "unsaved" && <span>Unsaved changes</span>}
              </div>
            </div>

            <h2 className="question-text">{currentQuestion.question}</h2>

            <div className="answer-section">
              <div className="answer-label">
                <span>Your Answer:</span>
                <span style={{ fontSize: "0.8125rem", color: "#71717a" }}>
                  {currentText.length} characters
                </span>
              </div>

              <textarea
                className="answer-textarea"
                placeholder="Type your explanation or technical answer here in your own words..."
                value={currentText}
                onChange={handleTextChange}
                rows={7}
                autoFocus
              />
            </div>
          </div>
        )}

        {/* Footer Navigation Controls */}
        <div className="session-footer">
          <div className="nav-actions-left">
            <button
              type="button"
              className="btn-session secondary"
              onClick={() => navigateToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              className="btn-session skip"
              onClick={handleSkip}
            >
              <SkipForward size={16} />
              <span>Skip Question</span>
            </button>
          </div>

          <div className="nav-actions-right">
            <button
              type="button"
              className="btn-session danger"
              onClick={() => setShowEndModal(true)}
            >
              <span>End Interview</span>
            </button>

            {currentIndex < totalQuestions - 1 ? (
              <button
                type="button"
                className="btn-session primary"
                onClick={() => navigateToQuestion(currentIndex + 1)}
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                className="btn-session primary"
                onClick={() => setShowEndModal(true)}
              >
                <Send size={16} />
                <span>Finish & View Results</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation End Modal */}
      {showEndModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div className="modal-icon-alert">
              <AlertTriangle size={24} />
            </div>

            <h3 className="modal-title">Finish Practice Interview?</h3>
            <p className="modal-desc">
              You have answered {answeredCount} of {totalQuestions} questions. Are you ready to submit and review your results and key takeaways?
            </p>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-session secondary"
                onClick={() => setShowEndModal(false)}
                disabled={submitting}
              >
                Keep Practicing
              </button>

              <button
                type="button"
                className="btn-session primary"
                onClick={handleEndInterview}
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Yes, Finish Interview"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewSession;
