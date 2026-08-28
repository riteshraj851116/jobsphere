import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./CareerAssistant.css";

const STORAGE_KEY = "jobsphere_ai_conversation";

const QUICK_PROMPTS = [
  "Recommend jobs based on my skills",
  "Analyze my career path",
  "What skills should I learn next?",
  "Help me prepare for interviews",
];

function CareerAssistant() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);

  const [messages, setMessages] = useState(() => {
    try {
      const savedMessages = localStorage.getItem(STORAGE_KEY);

      if (savedMessages) {
        return JSON.parse(savedMessages);
      }
    } catch (error) {
      console.error(
        "Could not restore AI conversation:",
        error
      );
    }

    return [
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Hi! I'm your JobSphere AI career assistant. I can help you discover jobs, improve your career path, prepare for interviews, and identify skills to learn next.",
        recommendedJobs: [],
      },
    ];
  });

  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] =
    useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error(
        "Could not save AI conversation:",
        error
      );
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);

      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
        });
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isLoading]);

  const clearConversation = () => {
    const welcomeMessage = {
      id: Date.now(),
      role: "assistant",
      content:
        "Conversation cleared. What would you like help with?",
      recommendedJobs: [],
    };

    setMessages([welcomeMessage]);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([welcomeMessage])
    );
  };

  const handleSendMessage = async (
    customMessage
  ) => {
    const message =
      typeof customMessage === "string"
        ? customMessage.trim()
        : input.trim();

    if (!message || isLoading) {
      return;
    }

    if (!user) {
      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: Date.now(),
          role: "assistant",
          content:
            "Please log in first so I can give you personalized career and job recommendations.",
          recommendedJobs: [],
        },
      ]);

      return;
    }

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: message,
      recommendedJobs: [],
    };

    const updatedMessages = [
      ...messages,
      userMessage,
    ];

    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const conversationHistory =
        updatedMessages
          .filter(
            (item) =>
              item.role === "user" ||
              item.role === "assistant"
          )
          .slice(-12)
          .map((item) => ({
            role: item.role,
            content: item.content,
          }));

      const token =
        localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5002/api/ai/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            ...(token
              ? {
                  Authorization:
                    `Bearer ${token}`,
                }
              : {}),
          },

          body: JSON.stringify({
            message,
            conversationHistory,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to get AI response"
        );
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content:
          data?.data?.message ||
          "Sorry, I could not generate a response.",
        recommendedJobs:
          data?.data?.recommendedJobs || [],
      };

      setMessages((previousMessages) => [
        ...previousMessages,
        aiMessage,
      ]);
    } catch (error) {
      console.error(
        "AI chat error:",
        error
      );

      setMessages((previousMessages) => [
        ...previousMessages,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error.message ||
            "Something went wrong while connecting to the AI assistant.",
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
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleJobClick = (jobId) => {
    if (!jobId) {
      return;
    }

    setIsOpen(false);

    navigate(`/jobs/${jobId}`);
  };

  return (
    <>
      <button
        type="button"
        className="career-ai-trigger"
        onClick={() =>
          setIsOpen((previous) => !previous)
        }
        aria-label="Open JobSphere AI Assistant"
      >
        <span className="career-ai-trigger-dot" />

        <span className="career-ai-trigger-text">
          AI
        </span>

        <span className="career-ai-trigger-label">
          Career Assistant
        </span>
      </button>

      {isOpen && (
        <div className="career-ai-panel">
          <div className="career-ai-header">
            <div className="career-ai-brand">
              <span className="career-ai-status" />

              <div>
                <span className="career-ai-eyebrow">
                  JOBSPHERE INTELLIGENCE
                </span>

                <h3>
                  Career Assistant
                </h3>
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
                onClick={() =>
                  setIsOpen(false)
                }
                className="career-ai-header-button"
                title="Close assistant"
              >
                Close
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
                  {message.role === "assistant"
                    ? "JOBSPHERE AI"
                    : "YOU"}
                </div>

                <div
                  className={`career-ai-message-content ${
                    message.isError
                      ? "career-ai-message-error"
                      : ""
                  }`}
                >
                  {message.content}
                </div>

                {message.recommendedJobs?.length >
                  0 && (
                  <div className="career-ai-job-list">
                    <div className="career-ai-job-list-title">
                      Recommended opportunities
                    </div>

                    {message.recommendedJobs.map(
                      (job) => (
                        <button
                          type="button"
                          key={job.id}
                          className="career-ai-job-card"
                          onClick={() =>
                            handleJobClick(job.id)
                          }
                        >
                          <div className="career-ai-job-top">
                            <div>
                              <span className="career-ai-job-title">
                                {job.title}
                              </span>

                              <span className="career-ai-job-company">
                                {
                                  job.company
                                    ?.name
                                }
                              </span>
                            </div>

                            {job.matchScore >
                              0 && (
                              <span className="career-ai-match">
                                {job.matchScore}%
                              </span>
                            )}
                          </div>

                          <div className="career-ai-job-meta">
                            {job.location && (
                              <span>
                                {job.location}
                              </span>
                            )}

                            {job.jobType && (
                              <span>
                                {job.jobType}
                              </span>
                            )}
                          </div>

                          {job.skills?.length >
                            0 && (
                            <div className="career-ai-job-skills">
                              {job.skills
                                .slice(0, 3)
                                .map((skill) => (
                                  <span
                                    key={
                                      typeof skill ===
                                      "string"
                                        ? skill
                                        : skill.name
                                    }
                                  >
                                    {typeof skill ===
                                    "string"
                                      ? skill
                                      : skill.name}
                                  </span>
                                ))}
                            </div>
                          )}

                          <span className="career-ai-job-view">
                            View opportunity →
                          </span>
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="career-ai-message career-ai-message-assistant">
                <div className="career-ai-message-label">
                  JOBSPHERE AI
                </div>

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
                onClick={() =>
                  handleSendMessage(prompt)
                }
              >
                {prompt}
              </button>
            ))}
          </div>

          <form
            className="career-ai-input-area"
            onSubmit={handleSubmit}
          >
            <textarea
              ref={inputRef}
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Ask about jobs, skills, interviews..."
              disabled={isLoading}
              rows="1"
            />

            <button
              type="submit"
              disabled={
                !input.trim() || isLoading
              }
            >
              {isLoading
                ? "..."
                : "Send"}
            </button>
          </form>

          <div className="career-ai-footer">
            AI recommendations are based on your
            JobSphere profile and available jobs.
          </div>
        </div>
      )}
    </>
  );
}

export default CareerAssistant;