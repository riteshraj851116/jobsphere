import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5005";

export const SocketProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Map());

  // Connect to socket when authenticated
  useEffect(() => {
    if (!isAuthenticated || !user?._id) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const newSocket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      setIsConnected(true);

      // Join user room
      if (user?._id) {
        newSocket.emit("join-user", user._id.toString());
      }
    });

    newSocket.on("disconnect", () => {
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      setIsConnected(false);
    });

    // Presence updates
    newSocket.on("presence-update", ({ userId, online }) => {
      setOnlineUsers((prev) => {
        const updated = new Map(prev);
        if (online) {
          updated.set(userId, true);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated, user?._id]);

  // Join conversation room
  const joinConversation = useCallback(
    (conversationId) => {
      if (socket && conversationId) {
        socket.emit("join-conversation", conversationId);
      }
    },
    [socket]
  );

  // Leave conversation room
  const leaveConversation = useCallback(
    (conversationId) => {
      if (socket && conversationId) {
        socket.emit("leave-conversation", conversationId);
      }
    },
    [socket]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (conversationId, isTyping) => {
      if (socket && conversationId) {
        socket.emit("typing", { conversationId, isTyping });
      }
    },
    [socket]
  );

  // Listen for new messages
  const onNewMessage = useCallback(
    (callback) => {
      if (!socket) return;

      socket.on("new-message", callback);

      return () => {
        socket.off("new-message", callback);
      };
    },
    [socket]
  );

  // Listen for conversation messages
  const onConversationMessage = useCallback(
    (callback) => {
      if (!socket) return;

      socket.on("conversation-message", callback);

      return () => {
        socket.off("conversation-message", callback);
      };
    },
    [socket]
  );

  // Listen for typing events
  const onTyping = useCallback(
    (callback) => {
      if (!socket) return;

      socket.on("typing", callback);

      return () => {
        socket.off("typing", callback);
      };
    },
    [socket]
  );

  const value = {
    socket,
    isConnected,
    onlineUsers,
    isUserOnline: (userId) => onlineUsers.has(userId?.toString()),
    joinConversation,
    leaveConversation,
    sendTyping,
    onNewMessage,
    onConversationMessage,
    onTyping,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const ctx = useContext(SocketContext);

  if (!ctx) {
    throw new Error("useSocket must be used inside SocketProvider");
  }

  return ctx;
};

export default SocketContext;
