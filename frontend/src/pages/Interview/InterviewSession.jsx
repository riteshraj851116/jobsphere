import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  Layers,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Bot,
  Eye,
  EyeOff,
  ThumbsUp,
  AlertCircle
} from "lucide-react";
import {
  getInterviewSession,
  saveInterviewAnswer,
  completeInterviewSession,
  evaluateInterviewAnswer
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

  // Advanced Interactive State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluationMap, setEvaluationMap] = useState({});
  const [showModelAnswer, setShowModelAnswer] = useState(false);

  const debounceTimerRef = useRef(null);
  const timerIntervalRef = useRef(null);
  const recognitionRef = useRef(null);

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

        // Normalise questions — offline and backend sessions
        const normalizedQuestions = (data.questions || []).map((q, idx) => {
          const raw = q.questionId && typeof q.questionId === "object" ? q.questionId : q;
          const questionText = raw.question || raw.text || raw.title || `Interview Question ${idx + 1}`;
          const answerText = raw.expectedAnswer || raw.sampleAnswer || raw.explanation || "";
          return {
            ...raw,
            _id: raw._id || raw.id || `q-${idx}`,
            id: raw.id || raw._id || `q-${idx}`,
            question: questionText,
            text: questionText,
            category: raw.category || data.role || "Technical",
            difficulty: raw.difficulty || data.difficulty || "medium",
            role: raw.role || data.role || "Developer",
            expectedAnswer: answerText,
            sampleAnswer: answerText
          };
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

    if (isSpeaking && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }
    setShowModelAnswer(false);

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

  // Speech Recognition (Voice Input)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setCurrentText((prev) => {
            const separator = prev && !prev.endsWith(" ") ? " " : "";
            const updated = prev + separator + transcript;
            if (currentQuestionId) {
              setAnswersMap((map) => ({
                ...map,
                [currentQuestionId]: { answer: updated, skipped: false }
              }));
              persistAnswer(currentQuestionId, updated, false);
            }
            return updated;
          });
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  // Text to Speech (Listen to Question)
  const toggleTextToSpeech = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const questionText = currentQuestion?.question || currentQuestion?.text || "";
    if (!questionText) return;

    const utterance = new SpeechSynthesisUtterance(questionText);
    utterance.rate = 0.95;
    utterance.pitch = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  // Instant AI Answer Evaluation
  const handleEvaluateCurrentAnswer = async () => {
    if (!currentText || currentText.trim().length < 5) {
      alert("Please provide at least a few words in your answer to evaluate.");
      return;
    }

    try {
      setEvaluating(true);
      const res = await evaluateInterviewAnswer({
        question: currentQuestion.question || currentQuestion.text,
        expectedAnswer: currentQuestion.expectedAnswer || currentQuestion.sampleAnswer,
        answer: currentText,
        role: session?.role || "Developer",
        difficulty: session?.difficulty || "medium"
      });

      const evalData = res?.data || res;
      setEvaluationMap((prev) => ({
        ...prev,
        [currentQuestionId]: evalData
      }));
    } catch (err) {
      console.warn("Evaluation error:", err);
    } finally {
      setEvaluating(false);
    }
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
      if (isSpeaking && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (isListening) {
        recognitionRef.current?.stop();
      }
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

  const currentEval = evaluationMap[currentQuestionId];

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

        {/* Question Matrix Navigator */}
        <div className="question-matrix-palette" title="Click any question number to jump directly">
          {session.questions.map((q, idx) => {
            const qId = q._id || q.id;
            const ansObj = answersMap[qId];
            const isAnswered = ansObj && !ansObj.skipped && ansObj.answer && ansObj.answer.trim().length > 0;
            const isSkipped = ansObj?.skipped;
            const isCurrent = idx === currentIndex;
            const isEval = !!evaluationMap[qId];

            let statusClass = "pending";
            if (isAnswered) statusClass = "answered";
            if (isSkipped) statusClass = "skipped";
            if (isCurrent) statusClass += " active";

            return (
              <button
                type="button"
                key={qId || idx}
                className={`palette-pill ${statusClass}`}
                onClick={() => navigateToQuestion(idx)}
              >
                <span>{idx + 1}</span>
                {isEval && <span className="palette-eval-dot" />}
              </button>
            );
          })}
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
                <span>{currentQuestion.category || "Technical Interview"}</span>
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

            <h2 className="question-text">{currentQuestion.question || currentQuestion.text || currentQuestion.title}</h2>

            {/* Audio & Tool Action Bar */}
            <div className="question-tools-bar">
              <div className="tools-group">
                <button
                  type="button"
                  className="tool-action-btn"
                  onClick={toggleTextToSpeech}
                  title="Listen to question"
                >
                  {isSpeaking ? <VolumeX size={15} color="#ef4444" /> : <Volume2 size={15} color="#2563eb" />}
                  <span>{isSpeaking ? "Stop Audio" : "Listen to Question"}</span>
                </button>

                <button
                  type="button"
                  className={`tool-action-btn ${isListening ? "listening" : ""}`}
                  onClick={toggleSpeechRecognition}
                  title="Speak your answer"
                >
                  {isListening ? <MicOff size={15} /> : <Mic size={15} color="#16a34a" />}
                  <span>{isListening ? "Listening (Click to Stop)" : "Voice Input (Speak)"}</span>
                </button>
              </div>

              <div className="tools-group">
                <button
                  type="button"
                  className="tool-action-btn ai-eval"
                  onClick={handleEvaluateCurrentAnswer}
                  disabled={evaluating || !currentText.trim()}
                  title="Evaluate current answer with AI"
                >
                  {evaluating ? (
                    <>
                      <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                      <span>Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <Bot size={15} />
                      <span>AI Answer Feedback</span>
                    </>
                  )}
                </button>

                {(currentQuestion.expectedAnswer || currentQuestion.sampleAnswer) && (
                  <button
                    type="button"
                    className="tool-action-btn"
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    title="View model sample answer"
                  >
                    {showModelAnswer ? <EyeOff size={14} /> : <Eye size={14} />}
                    <span>{showModelAnswer ? "Hide Sample Answer" : "Sample Answer"}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Model Answer Preview Drawer */}
            {showModelAnswer && (
              <div className="eval-sample-box" style={{ marginBottom: "1.25rem", background: "#f8fafc", border: "1px dashed #94a3b8" }}>
                <div style={{ fontWeight: 700, color: "#475569", marginBottom: "0.25rem", fontSize: "0.8125rem", textTransform: "uppercase" }}>
                  Ideal Model Concept / Answer:
                </div>
                <div>{currentQuestion.expectedAnswer || currentQuestion.sampleAnswer}</div>
              </div>
            )}

            {/* Answer Text Area */}
            <div className="answer-section">
              <div className="answer-label">
                <span>Your Answer:</span>
                <span style={{ fontSize: "0.8125rem", color: "#71717a" }}>
                  {currentText.length} characters &bull; {currentText.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>

              <textarea
                className="answer-textarea"
                placeholder="Type your technical explanation here, or use 'Voice Input' to speak your answer naturally..."
                value={currentText}
                onChange={handleTextChange}
                rows={7}
              />
            </div>

            {/* Inline AI Evaluation Feedback Card */}
            {currentEval && (
              <div className="inline-ai-eval-card">
                <div className="ai-eval-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Bot size={18} color="#4f46e5" />
                    <span style={{ fontWeight: 700, fontSize: "0.9375rem" }}>Instant AI Evaluation</span>
                  </div>
                  <span className={`ai-score-badge ${currentEval.score >= 80 ? "high" : currentEval.score >= 65 ? "medium" : "low"}`}>
                    Score: {currentEval.score}% &bull; {currentEval.rating}
                  </span>
                </div>

                <p style={{ margin: "0 0 0.75rem", fontSize: "0.875rem", color: "#334155" }}>
                  {currentEval.feedback}
                </p>

                {currentEval.strengths && currentEval.strengths.length > 0 && (
                  <div>
                    <div className="eval-section-title">Key Strengths:</div>
                    <ul className="eval-bullet-list">
                      {currentEval.strengths.map((s, sIdx) => (
                        <li key={sIdx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {currentEval.improvements && currentEval.improvements.length > 0 && (
                  <div>
                    <div className="eval-section-title">Suggested Improvements & Missing Concepts:</div>
                    <ul className="eval-bullet-list">
                      {currentEval.improvements.map((imp, impIdx) => (
                        <li key={impIdx}>{imp}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
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
