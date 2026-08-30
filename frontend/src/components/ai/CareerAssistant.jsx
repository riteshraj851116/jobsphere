import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { sendAIMessage } from "../../services/aiService";
import "./CareerAssistant.css";

const STORAGE_KEY = "jobsphere_ai_conversation";

const QUICK_PROMPTS = [
  "🎯 Recommend top jobs based on my skills",
  "📄 Analyze my resume & profile for improvements",
  "🚀 What high-impact skills should I learn next?",
  "💡 Prepare me for Full Stack live interview rounds",
];

// Simple markdown formatter helper for clean bullet points, bolding, and headings
const renderFormattedText = (text) => {
  if (!text) return "";
  
  const lines = text.split("\n");
  return lines.map((line, idx) => {
    // Heading 4
    if (line.startsWith("#### ")) {
      return (
        <h5 key={idx} style={{ margin: "8px 0 4px", fontSize: "0.95rem", fontWeight: 700, color: "#111" }}>
          {line.replace("#### ", "")}
        </h5>
      );
    }
    // Heading 3
    if (line.startsWith("### ")) {
      return (
        <h4 key={idx} style={{ margin: "10px 0 6px", fontSize: "1.05rem", fontWeight: 800, color: "#000" }}>
          {line.replace("### ", "")}
        </h4>
      );
    }
    // Bullet item
    if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
      const content = line.trim().substring(2);
      return (
        <div key={idx} style={{ display: "flex", gap: "8px", margin: "4px 0", paddingLeft: "4px" }}>
          <span style={{ color: "#3b82f6", fontWeight: "bold" }}>•</span>
          <span>{parseBold(content)}</span>
        </div>
      );
    }
    // Numbered list item
    const numMatch = line.trim().match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      return (
        <div key={idx} style={{ display: "flex", gap: "8px", margin: "4px 0", paddingLeft: "4px" }}>
          <span style={{ color: "#10b981", fontWeight: 700 }}>{numMatch[1]}.</span>
          <span>{parseBold(numMatch[2])}</span>
        </div>
      );
    }
    // Regular line
    if (!line.trim()) {
      return <div key={idx} style={{ height: "6px" }} />;
    }
    return <p key={idx} style={{ margin: "4px 0", lineHeight: 1.5 }}>{parseBold(line)}</p>;
  });
};

const parseBold = (text) => {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={index} style={{ fontWeight: 700, color: "#111" }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          style={{
            background: "#f1f5f9",
            padding: "2px 5px",
            borderRadius: "4px",
            fontSize: "0.85em",
            fontFamily: "monospace",
            color: "#0f172a"
          }}
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
};

function CareerAssistant() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error("Could not restore AI conversation:", error);
    }

    return [
      {
        id: 1,
        role: "assistant",
        content:
          "### 🤖 JobSphere AI Career Copilot\n\nHi! I'm your AI career and interview assistant. I can analyze your resume, recommend active job matches from top tech companies, help you prepare for live coding rounds, and roadmap your technical skills.",
        recommendedJobs: [],
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (error) {
      console.error("Could not save AI conversation:", error);
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const clearConversation = () => {
    const welcome = {
      id: Date.now(),
      role: "assistant",
      content: "### Conversation Cleared\n\nHow can I help you accelerate your tech career today?",
      recommendedJobs: [],
    };
    setMessages([welcome]);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([welcome]));
  };

  const handleSendMessage = async (customMessage) => {
    const textToSend =
      typeof customMessage === "string" ? customMessage.trim() : input.trim();

    if (!textToSend || isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: textToSend,
      recommendedJobs: [],
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory = updatedMessages
        .filter((item) => item.role === "user" || item.role === "assistant")
        .slice(-10)
        .map((item) => ({
          role: item.role,
          content: item.content,
        }));

      const res = await sendAIMessage(textToSend, conversationHistory);
      const aiReply = res?.data?.message || res?.message || "I've analyzed your query and here are my recommendations.";
      const recJobs = res?.data?.recommendedJobs || res?.recommendedJobs || [];

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: aiReply,
        recommendedJobs: recJobs,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("AI chat error:", error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: "Sorry, I encountered a temporary issue generating that response. Please try asking again or select one of the quick topics below.",
          recommendedJobs: [],
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleSendMessage();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleJobClick = (jobId) => {
    if (!jobId) return;
    setIsOpen(false);
    navigate(`/jobs/${jobId}`);
  };

  return (
    <>
      <button
        type="button"
        className="career-ai-trigger"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open JobSphere AI Assistant"
      >
        <span className="career-ai-trigger-dot" />
        <span className="career-ai-trigger-text">AI</span>
        <span className="career-ai-trigger-label">Career Copilot</span>
      </button>

      {isOpen && (
        <div className="career-ai-panel">
          <div className="career-ai-header">
            <div className="career-ai-brand">
              <span className="career-ai-status" />
              <div>
                <span className="career-ai-eyebrow">JOBSPHERE INTELLIGENCE</span>
                <h3>AI Career Copilot</h3>
              </div>
            </div>

            <div className="career-ai-actions">
              <button
                type="button"
                onClick={clearConversation}
                className="career-ai-header-button"
                title="Clear conversation"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="career-ai-header-button"
                title="Close assistant"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="career-ai-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`career-ai-message career-ai-message-${message.role}`}
              >
                <div className="career-ai-message-label">
                  {message.role === "assistant" ? "⚡ JOBSPHERE AI" : "👤 YOU"}
                </div>

                <div
                  className={`career-ai-message-content ${
                    message.isError ? "career-ai-message-error" : ""
                  }`}
                >
                  {renderFormattedText(message.content)}
                </div>

                {message.recommendedJobs?.length > 0 && (
                  <div className="career-ai-job-list">
                    <div className="career-ai-job-list-title">
                      🎯 Recommended Opportunities for You
                    </div>

                    {message.recommendedJobs.map((job) => (
                      <button
                        type="button"
                        key={job._id || job.id}
                        className="career-ai-job-card"
                        onClick={() => handleJobClick(job._id || job.id)}
                      >
                        <div className="career-ai-job-top">
                          <div>
                            <span className="career-ai-job-title">
                              {job.title}
                            </span>
                            <span className="career-ai-job-company">
                              {job.company?.name || job.companyName || "Top Company"}
                            </span>
                          </div>

                          {job.matchScore && (
                            <span className="career-ai-match">
                              {job.matchScore}% Match
                            </span>
                          )}
                        </div>

                        <div className="career-ai-job-meta">
                          {job.location && <span>📍 {job.location}</span>}
                          {job.jobType && <span>💼 {job.jobType}</span>}
                        </div>

                        {job.skills?.length > 0 && (
                          <div className="career-ai-job-skills">
                            {job.skills.slice(0, 3).map((skill) => (
                              <span key={typeof skill === "string" ? skill : skill.name}>
                                {typeof skill === "string" ? skill : skill.name}
                              </span>
                            ))}
                          </div>
                        )}

                        <span className="career-ai-job-view">
                          View Details & Apply →
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="career-ai-message career-ai-message-assistant">
                <div className="career-ai-message-label">⚡ JOBSPHERE AI</div>
                <div className="career-ai-thinking">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="career-ai-quick-prompts">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="career-ai-input-area" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about jobs, salary, resume, or interview questions..."
              disabled={isLoading}
              rows="1"
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
            >
              {isLoading ? "..." : "Send"}
            </button>
          </form>

          <div className="career-ai-footer">
            Powered by Google Gemini & JobSphere Matchmaking Engine
          </div>
        </div>
      )}
    </>
  );
}

export default CareerAssistant;