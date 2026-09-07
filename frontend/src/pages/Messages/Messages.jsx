import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";

import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "../../services/messageService";

import { getUserById } from "../../services/userService";
import { isValidObjectId } from "../../utils/validation";

import { useAuth } from "../../hooks/useAuth";
import { useSocket } from "../../context/SocketContext";

import "./Messages.css";

// Deduplicate an array of messages by backend _id (idempotent merge).
const dedupeById = (list) => {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const result = [];
  for (const message of list) {
    const id = message?._id?.toString?.() || message?._id;
    if (!message || !id || seen.has(id)) continue;
    seen.add(id);
    result.push(message);
  }
  return result;
};

const Messages = () => {
  const { user } = useAuth();
  const { joinConversation, leaveConversation, onNewMessage, isConnected } = useSocket();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] =
    useState(null);

  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] =
    useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };
  // The same backend _id must never appear twice in state.
  // This protects against optimistic-append + socket echo +
  // refetch duplication, which was causing React duplicate-key
  // warnings in the message list.
  // =========================================================

  const appendMessage = (message) => {
    if (!message?._id) {
      return;
    }

    setMessages((prev) => {
      if (prev.some((m) => m?._id?.toString() === message._id.toString())) {
        return prev;
      }
      return [...prev, message];
    });
  };

  const getUserId = (value) => {
    if (!value) {
      return "";
    }

    if (typeof value === "string") {
      return isValidObjectId(value) ? value : "";
    }

    if (typeof value === "object") {
      const id = value._id || value.id || value.userId;
      return (id && isValidObjectId(id)) ? id : "";
    }

    return "";
  };

  // =========================================================
  // LOAD CONVERSATIONS
  // =========================================================

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getConversations();

        if (!mounted) {
          return;
        }

        const list =
          response?.data?.conversations ||
          response?.conversations ||
          [];

        setConversations(list);

        // ---------------------------------------------------
        // USER ID FROM URL
        // ---------------------------------------------------

        const params = new URLSearchParams(
          location.search
        );

        const urlUserId = params.get("userId");

        if (!urlUserId) {
          return;
        }

        // ---------------------------------------------------
        // FIND EXISTING CONVERSATION
        // ---------------------------------------------------

        const existingConversation = list.find(
          (conversation) => {
            const participant =
              conversation?.participant;

            const participantId =
              getUserId(participant);

            return (
              participantId &&
              participantId.toString() ===
                urlUserId.toString()
            );
          }
        );

        if (existingConversation) {
          setSelectedConversation(
            existingConversation
          );

          await loadMessages(
            existingConversation._id
          );

          return;
        }

        // ---------------------------------------------------
        // NEW CONVERSATION - FETCH REAL USER DATA
        // ---------------------------------------------------

        try {
          const userResponse = await getUserById(urlUserId);
          const userData = userResponse?.data?.user || userResponse?.user;

          if (userData) {
            setSelectedConversation({
              _id: null,
              participant: {
                _id: userData._id,
                name: userData.name || userData.username || "User",
                username: userData.username || "User",
                profilePicture: userData.profilePicture || "",
                headline: userData.headline || "",
              },
              isNew: true,
            });
            setMessages([]);
          } else {
            setError("Unable to load user information. Please try again.");
          }
        } catch (fetchError) {
          console.error("Failed to fetch user for new conversation:", fetchError);
          setError("Unable to load user information. Please try again.");
        }
      } catch (err) {
        if (mounted) {
          setError(
            err?.response?.data?.message ||
              "Failed to load conversations"
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [location.search]);

  // =========================================================
  // REAL-TIME MESSAGES
  // Listener registered once per conversation; cleaned up on
  // unmount / conversation change via unsubscribe.
  // =========================================================

  useEffect(() => {
    if (!isConnected || !selectedConversation?._id || !onNewMessage) {
      return undefined;
    }

    const unsubscribe = onNewMessage((message) => {
      const messageConversationId = message?.conversation?._id || message?.conversation;

      if (messageConversationId?.toString() === selectedConversation._id?.toString()) {
        appendMessage(message);
        setTimeout(() => scrollToBottom(), 50);
      }
    });

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, selectedConversation?._id, onNewMessage]);

  // =========================================================
  // SERVERLESS REAL-TIME POLLING FALLBACK
  // When WebSocket connection is unavailable (e.g., serverless Vercel),
  // poll active conversation every 3.5 seconds so messages sync seamlessly.
  // =========================================================
  useEffect(() => {
    if (!selectedConversation?._id) return;

    const interval = setInterval(async () => {
      if (document.hidden) return;

      try {
        const response = await getMessages(selectedConversation._id);
        const list = response?.data?.messages || response?.messages || [];
        if (Array.isArray(list) && list.length > 0) {
          setMessages((prev) => {
            const merged = dedupeById([...prev, ...list]);
            if (merged.length !== prev.length) {
              setTimeout(() => scrollToBottom(), 50);
              return merged;
            }
            return prev;
          });
        }
      } catch (pollErr) {
        // silent background poll catch
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [selectedConversation?._id]);

  // Periodic sidebar conversations refresh to update unread counts and last message previews
  useEffect(() => {
    const interval = setInterval(async () => {
      if (document.hidden) return;
      try {
        const res = await getConversations();
        const list = res?.data?.conversations || res?.conversations || [];
        if (Array.isArray(list) && list.length > 0) {
          setConversations(list);
        }
      } catch (e) {}
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll on initial load of conversation
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("auto");
    }
  }, [selectedConversation?._id]);

  // =========================================================
  // LOAD MESSAGES
  // =========================================================

  const loadMessages = async (conversationId) => {
    if (!conversationId) {
      setMessages([]);
      return;
    }

    try {
      setMessagesLoading(true);
      setError("");

      const response =
        await getMessages(conversationId);

      const list =
        response?.data?.messages ||
        response?.messages ||
        [];

      setMessages(
        dedupeById(list)
      );

      // -----------------------------------------------------
      // MARK AS READ
      // -----------------------------------------------------

      try {
        await markMessagesAsRead(
          conversationId
        );
      } catch (readError) {
        // Silently handle read errors - they shouldn't block the UI
      }

      // -----------------------------------------------------
      // RESET UNREAD COUNT
      // -----------------------------------------------------

      setConversations((previous) =>
        previous.map((conversation) => {
          const conversationIdString =
            conversation?._id?.toString();

          if (
            conversationIdString ===
            conversationId?.toString()
          ) {
            return {
              ...conversation,
              unreadCount: 0,
            };
          }

          return conversation;
        })
      );
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to load messages"
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  // =========================================================
  // SELECT CONVERSATION
  // =========================================================

  const handleSelectConversation = async (
    conversation
  ) => {
    if (!conversation) {
      return;
    }

    setError("");

    // Leave previous conversation room
    if (selectedConversation?._id) {
      leaveConversation(selectedConversation._id);
    }

    setSelectedConversation(
      conversation
    );

    // Join new conversation room
    if (conversation._id) {
      joinConversation(conversation._id);
    }

    await loadMessages(
      conversation._id
    );
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage = async (
    event
  ) => {
    event.preventDefault();

    if (sending) {
      return;
    }

    const messageText =
      typeof text === "string"
        ? text.trim()
        : "";

    if (!messageText) {
      return;
    }

    // -------------------------------------------------------
    // GET PARTICIPANT
    // -------------------------------------------------------

    const participant =
      selectedConversation?.participant;

    // -------------------------------------------------------
    // GET REAL RECEIVER ID
    // -------------------------------------------------------

    const receiverId =
      getUserId(participant);

    // -------------------------------------------------------
    // VALIDATE RECEIVER
    // -------------------------------------------------------

    if (!receiverId) {
      setError(
        "Receiver information is missing."
      );

      return;
    }

    // -------------------------------------------------------
    // VALIDATE MONGODB OBJECT ID
    // -------------------------------------------------------

    const mongoObjectIdRegex =
      /^[a-fA-F0-9]{24}$/;

    if (
      !mongoObjectIdRegex.test(
        receiverId.toString()
      )
    ) {
      console.error(
        "INVALID RECEIVER ID:",
        receiverId
      );

      setError(
        "Invalid receiver ID. Please open the recruiter profile again."
      );

      return;
    }

    try {
      setSending(true);
      setError("");

      // -----------------------------------------------------
      // SEND
      // -----------------------------------------------------

      const response =
        await sendMessage({
          receiverId:
            receiverId.toString(),

          text: messageText,
        });

      // -----------------------------------------------------
      // GET CREATED MESSAGE
      // -----------------------------------------------------

      const newMessage =
        response?.data?.message ||
        null;

      if (!newMessage) {
        console.warn(
          "Message sent but response did not contain message."
        );
      } else {
        appendMessage(newMessage);
        setTimeout(() => scrollToBottom(), 50);
      }

      // -----------------------------------------------------
      // CLEAR INPUT
      // -----------------------------------------------------

      setText("");

      // -----------------------------------------------------
      // REFRESH CONVERSATIONS
      // -----------------------------------------------------

      const conversationsResponse =
        await getConversations();

      const updatedList =
        conversationsResponse?.data
          ?.conversations ||
        conversationsResponse?.conversations ||
        [];

      setConversations(
        updatedList
      );

      // -----------------------------------------------------
      // FIND NEW CONVERSATION
      // -----------------------------------------------------

      let updatedConversation = null;

      if (newMessage) {
        const messageConversation =
          newMessage?.conversation;

        const newConversationId =
          typeof messageConversation ===
          "object"
            ? messageConversation?._id
            : messageConversation;

        if (newConversationId) {
          updatedConversation =
            updatedList.find(
              (conversation) =>
                conversation?._id
                  ?.toString() ===
                newConversationId
                  ?.toString()
            );
        }
      }

      // -----------------------------------------------------
      // FALLBACK: FIND BY PARTICIPANT
      // -----------------------------------------------------

      if (!updatedConversation) {
        updatedConversation =
          updatedList.find(
            (conversation) => {
              const participantId =
                getUserId(
                  conversation?.participant
                );

              return (
                participantId &&
                participantId.toString() ===
                  receiverId.toString()
              );
            }
          );
      }

      // -----------------------------------------------------
      // SET CREATED CONVERSATION
      // -----------------------------------------------------

      if (updatedConversation) {
        setSelectedConversation(
          updatedConversation
        );

        // Load actual messages so the
        // conversation is completely synced.

        await loadMessages(
          updatedConversation._id
        );
      }
    } catch (err) {
      const backendMessage =
        err?.response?.data?.message;

      setError(
        backendMessage ||
          err?.message ||
          "Failed to send message"
      );
    } finally {
      setSending(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="messages-page">
        <div className="messages-loading">
          Loading messages...
        </div>
      </div>
    );
  }

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="messages-page">
      <div className="messages-container">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className={`messages-sidebar ${selectedConversation ? 'has-conversation' : ''}`}>

          <div className="messages-sidebar-header">
            <h2>Messages</h2>
          </div>

          {conversations.length === 0 ? (
            <div className="messages-empty">
              {selectedConversation?.isNew
                ? "New conversation"
                : "No conversations yet."}
            </div>
          ) : (
            <div className="conversation-list">

              {conversations.map(
                (conversation) => {
                  const participant =
                    conversation?.participant;

                  if (!participant) {
                    return null;
                  }

                  const conversationId =
                    conversation?._id?.toString();

                  const selectedId =
                    selectedConversation?._id?.toString();

                  const isActive =
                    conversationId &&
                    selectedId &&
                    conversationId ===
                      selectedId;

                  const participantName =
                    participant?.name ||
                    participant?.username ||
                    "User";

                  return (
                    <button
                      key={
                        conversation?._id
                      }
                      type="button"
                      className={`conversation-item ${
                        isActive
                          ? "conversation-item--active"
                          : ""
                      }`}
                      onClick={() =>
                        handleSelectConversation(
                          conversation
                        )
                      }
                    >

                      {/* AVATAR */}

                      <div className="conversation-avatar">

                        {participant?.profilePicture ? (
                          <img
                            src={
                              participant.profilePicture
                            }
                            alt={
                              participantName
                            }
                          />
                        ) : (
                          participantName
                            .charAt(0)
                            .toUpperCase()
                        )}

                      </div>

                      {/* CONTENT */}

                      <div className="conversation-content">

                        <div className="conversation-top">

                          <strong>
                            {
                              participantName
                            }
                          </strong>

                          {conversation?.unreadCount >
                            0 && (
                            <span className="unread-badge">
                              {
                                conversation.unreadCount
                              }
                            </span>
                          )}

                        </div>

                        <p>
                          {conversation
                            ?.lastMessage
                            ?.text ||
                            "Start a conversation"}
                        </p>

                      </div>

                    </button>
                  );
                }
              )}

            </div>
          )}

        </aside>

        {/* =================================================
            CHAT
        ================================================= */}

        <main className="messages-chat">

          {!selectedConversation ? (
            <div className="messages-placeholder">

              <h2>
                Your Messages
              </h2>

              <p>
                Select a conversation to
                start chatting.
              </p>

            </div>
          ) : (
            <>

              {/* =============================================
                  CHAT HEADER
              ============================================= */}

              <header className="chat-header">
                <button
                  type="button"
                  className="mobile-back-button"
                  onClick={() => setSelectedConversation(null)}
                >
                  ← Back
                </button>

                <div className="chat-user">

                  <div className="chat-avatar">

                    {selectedConversation
                      ?.participant
                      ?.profilePicture ? (
                      <img
                        src={
                          selectedConversation
                            .participant
                            .profilePicture
                        }
                        alt="Profile"
                      />
                    ) : (
                      (
                        selectedConversation
                          ?.participant
                          ?.name ||
                        selectedConversation
                          ?.participant
                          ?.username ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()
                    )}

                  </div>

                  <div>

                    <h3>
                      {selectedConversation
                        ?.participant
                        ?.name ||
                        selectedConversation
                          ?.participant
                          ?.username ||
                        "User"}
                    </h3>

                    <span>
                      {selectedConversation
                        ?.participant
                        ?.headline ||
                        ""}
                    </span>

                  </div>

                </div>

              </header>

              {/* =============================================
                  ERROR
              ============================================= */}

              {error && (
                <div className="messages-error">
                  {error}
                </div>
              )}

              {/* =============================================
                  MESSAGE LIST
              ============================================= */}

              <div className="chat-messages">

                {messagesLoading ? (
                  <div className="messages-loading">
                    Loading conversation...
                  </div>
                ) : messages.length ===
                  0 ? (
                  <div className="messages-placeholder">

                    <p>
                      No messages yet.
                    </p>

                    <span>
                      Send the first message.
                    </span>

                  </div>
                ) : (
                  messages.map(
                    (message) => {
                      const senderId =
                        message?.sender?._id ||
                        message?.sender;

                      const currentUserId =
                        getUserId(user);

                      const isMine =
                        senderId
                          ?.toString() ===
                        currentUserId
                          ?.toString();

                      return (
                        <div
                          key={message._id}
                          className={`message-row ${
                            isMine
                              ? "message-row--mine"
                              : "message-row--other"
                          }`}
                        >

                          <div className="message-bubble">

                            {message?.text && (
                              <p>
                                {
                                  message.text
                                }
                              </p>
                            )}

                            {message?.image && (
                              <img
                                src={
                                  message.image
                                }
                                alt="Message attachment"
                                className="message-image"
                              />
                            )}

                            <small>
                              {message?.createdAt
                                ? new Date(
                                    message.createdAt
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour:
                                        "2-digit",
                                      minute:
                                        "2-digit",
                                    }
                                  )
                                : ""}
                            </small>

                          </div>

                        </div>
                      );
                    }
                  )
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* =============================================
                  SEND FORM
              ============================================= */}

              <form
                className="chat-input-form"
                onSubmit={
                  handleSendMessage
                }
              >

                <input
                  type="text"
                  value={text}
                  onChange={(event) =>
                    setText(
                      event.target.value
                    )
                  }
                  placeholder="Write a message..."
                  disabled={sending}
                  maxLength={5000}
                  autoComplete="off"
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !text.trim() ||
                    !selectedConversation
                      ?.participant?._id
                  }
                >
                  {sending
                    ? "Sending..."
                    : "Send"}
                </button>

              </form>

            </>
          )}

        </main>

      </div>
    </div>
  );
};

export default Messages;