import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
} from "../../services/messageService";

import { useAuth } from "../../hooks/useAuth";

import "./Messages.css";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");

  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [error, setError] = useState("");

  // =========================================================
  // LOAD CONVERSATIONS
  // =========================================================

  useEffect(() => {
    loadConversations();
  }, [location.search]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getConversations();

      const list =
        response?.data?.conversations ||
        response?.conversations ||
        [];

      setConversations(list);

      // =====================================================
      // OPEN RECRUITER FROM JOB DETAILS
      // /messages?userId=RECRUITER_ID
      // =====================================================

      const params = new URLSearchParams(location.search);
      const userId = params.get("userId");

      if (userId) {
        const existingConversation = list.find(
          (conversation) =>
            conversation?.participant?._id?.toString() ===
            userId.toString()
        );

        if (existingConversation) {
          setSelectedConversation(existingConversation);

          await loadMessages(
            existingConversation._id
          );

          return;
        }

        // ---------------------------------------------------
        // No conversation exists yet.
        // We keep the userId so the UI can show a new chat.
        // ---------------------------------------------------

        setSelectedConversation({
          _id: null,
          participant: {
            _id: userId,
            name: "Recruiter",
            username: "Recruiter",
            profilePicture: "",
            headline: "",
          },
          isNew: true,
        });

        setMessages([]);
      }
    } catch (err) {
      console.error(
        "Load conversations error:",
        err
      );

      setError(
        err?.response?.data?.message ||
          "Failed to load conversations"
      );
    } finally {
      setLoading(false);
    }
  };

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

      const response = await getMessages(
        conversationId
      );

      const list =
        response?.data?.messages ||
        response?.messages ||
        [];

      setMessages(list);

      try {
        await markMessagesAsRead(
          conversationId
        );
      } catch (readError) {
        console.error(
          "Mark messages read error:",
          readError
        );
      }

      setConversations((previous) =>
        previous.map((conversation) =>
          conversation._id === conversationId
            ? {
                ...conversation,
                unreadCount: 0,
              }
            : conversation
        )
      );
    } catch (err) {
      console.error(
        "Load messages error:",
        err
      );

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
    setSelectedConversation(conversation);

    await loadMessages(
      conversation._id
    );
  };

  // =========================================================
  // SEND MESSAGE
  // =========================================================

  const handleSendMessage = async (event) => {
    event.preventDefault();

    const messageText = text.trim();

    if (!messageText) {
      return;
    }

    const receiverId =
      selectedConversation?.participant?._id;

    if (!receiverId) {
      setError(
        "Receiver information is missing."
      );

      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await sendMessage({
        receiverId,
        text: messageText,
      });

      const newMessage =
        response?.data?.message ||
        response?.message ||
        null;

      if (newMessage) {
        setMessages((previous) => [
          ...previous,
          newMessage,
        ]);
      }

      setText("");

      // -----------------------------------------------------
      // Refresh conversations after sending
      // -----------------------------------------------------

      const conversationsResponse =
        await getConversations();

      const updatedList =
        conversationsResponse?.data?.conversations ||
        conversationsResponse?.conversations ||
        [];

      setConversations(updatedList);

      // -----------------------------------------------------
      // Find newly-created conversation
      // -----------------------------------------------------

      if (newMessage?.conversation) {
        const conversationId =
          newMessage.conversation?._id ||
          newMessage.conversation;

        const updatedConversation =
          updatedList.find(
            (conversation) =>
              conversation._id?.toString() ===
              conversationId?.toString()
          );

        if (updatedConversation) {
          setSelectedConversation(
            updatedConversation
          );
        }
      } else {
        const updatedConversation =
          updatedList.find(
            (conversation) =>
              conversation?.participant?._id?.toString() ===
              receiverId.toString()
          );

        if (updatedConversation) {
          setSelectedConversation(
            updatedConversation
          );
        }
      }
    } catch (err) {
      console.error(
        "Send message error:",
        err
      );

      setError(
        err?.response?.data?.message ||
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
            CONVERSATIONS SIDEBAR
        ================================================= */}

        <aside className="messages-sidebar">

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

                  const isActive =
                    selectedConversation?._id ===
                    conversation._id;

                  return (
                    <button
                      key={conversation._id}
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

                        {participant.profilePicture ? (
                          <img
                            src={
                              participant.profilePicture
                            }
                            alt={
                              participant.name ||
                              "User"
                            }
                          />
                        ) : (
                          (
                            participant.name ||
                            participant.username ||
                            "U"
                          )
                            .charAt(0)
                            .toUpperCase()
                        )}

                      </div>

                      {/* CONTENT */}

                      <div className="conversation-content">

                        <div className="conversation-top">

                          <strong>
                            {participant.name ||
                              participant.username ||
                              "User"}
                          </strong>

                          {conversation.unreadCount >
                            0 && (
                            <span className="unread-badge">
                              {
                                conversation.unreadCount
                              }
                            </span>
                          )}

                        </div>

                        <p>
                          {conversation.lastMessage
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

              <h2>Your Messages</h2>

              <p>
                Select a conversation to
                start chatting.
              </p>

            </div>
          ) : (
            <>

              {/* =================================================
                  CHAT HEADER
              ================================================= */}

              <header className="chat-header">

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
                        ?.headline || ""}
                    </span>

                  </div>

                </div>

              </header>

              {/* =================================================
                  ERROR
              ================================================= */}

              {error && (
                <div className="messages-error">
                  {error}
                </div>
              )}

              {/* =================================================
                  MESSAGE LIST
              ================================================= */}

              <div className="chat-messages">

                {messagesLoading ? (
                  <div className="messages-loading">
                    Loading conversation...
                  </div>
                ) : messages.length === 0 ? (
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
                        user?._id ||
                        user?.id;

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

                            {message.text && (
                              <p>
                                {message.text}
                              </p>
                            )}

                            {message.image && (
                              <img
                                src={
                                  message.image
                                }
                                alt="Message attachment"
                                className="message-image"
                              />
                            )}

                            <small>
                              {message.createdAt
                                ? new Date(
                                    message.createdAt
                                  ).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
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

              </div>

              {/* =================================================
                  SEND FORM
              ================================================= */}

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