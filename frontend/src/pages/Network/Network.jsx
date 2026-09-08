import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  Send,
  MessageSquare,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Briefcase,
  GraduationCap,
  MapPin,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getMyConnections,
  getPendingRequests,
  getSentRequests,
  respondToRequest,
  cancelPendingRequest,
  removeConnection,
  getConnectionSuggestions,
  sendConnectionRequest
} from "../../services/connectionService";
import {
  getFollowers,
  getFollowing,
  followUser,
  unfollowUser,
  searchUsers
} from "../../services/userService";
import Loader from "../../components/common/Loader";
import "./Network.css";

const Network = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTabParam = searchParams.get("tab") || "connections";
  const [activeTab, setActiveTab] = useState(activeTabParam);

  // Stats
  const [stats, setStats] = useState({
    connections: 0,
    following: 0,
    followers: 0,
    receivedRequests: 0,
    sentRequests: 0
  });

  // Data lists
  const [connections, setConnections] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // States
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState(null);

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams, activeTab]);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Fetch all initial network data
  const loadNetworkData = useCallback(async () => {
    if (!currentUser?._id) return;
    setLoading(true);
    try {
      const [
        connRes,
        receivedRes,
        sentRes,
        suggRes,
        followersRes,
        followingRes
      ] = await Promise.allSettled([
        getMyConnections(),
        getPendingRequests(),
        getSentRequests(),
        getConnectionSuggestions(),
        getFollowers(currentUser._id),
        getFollowing(currentUser._id)
      ]);

      const conns = connRes.status === "fulfilled" ? connRes.value?.data?.connections || [] : [];
      const rec = receivedRes.status === "fulfilled" ? receivedRes.value?.data?.requests || [] : [];
      const sent = sentRes.status === "fulfilled" ? sentRes.value?.data?.requests || [] : [];
      const sugg = suggRes.status === "fulfilled" ? suggRes.value?.data?.suggestions || [] : [];
      const flwrs = followersRes.status === "fulfilled" ? followersRes.value?.data?.followers || [] : [];
      const flwing = followingRes.status === "fulfilled" ? followingRes.value?.data?.following || [] : [];

      setConnections(conns);
      setReceivedRequests(rec);
      setSentRequests(sent);
      setSuggestions(sugg);
      setFollowers(flwrs);
      setFollowing(flwing);

      setStats({
        connections: conns.length,
        receivedRequests: rec.length,
        sentRequests: sent.length,
        followers: flwrs.length,
        following: flwing.length
      });
    } catch (err) {
      console.error("Failed to load network data", err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?._id]);

  useEffect(() => {
    loadNetworkData();
  }, [loadNetworkData]);

  // Search handler with debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await searchUsers({ search: searchQuery.trim(), limit: 12 });
        setSearchResults(res?.data?.users || []);
      } catch (err) {
        console.error("User search error", err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Connection Actions
  const handleSendRequest = async (userId) => {
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await sendConnectionRequest(userId);
      showToast("Connection request sent successfully!");
      // Update suggestions list
      setSuggestions((prev) => prev.filter((s) => s._id !== userId));
      // Refresh sent requests
      const sentRes = await getSentRequests();
      const newSent = sentRes?.data?.requests || [];
      setSentRequests(newSent);
      setStats((prev) => ({ ...prev, sentRequests: newSent.length }));
    } catch (err) {
      showToast(err?.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const handleRespond = async (connectionId, action) => {
    setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      await respondToRequest(connectionId, action);
      showToast(`Connection request ${action}ed!`);
      // Refresh requests and connections
      setReceivedRequests((prev) => prev.filter((r) => r._id !== connectionId));
      setStats((prev) => ({ ...prev, receivedRequests: Math.max(0, prev.receivedRequests - 1) }));
      if (action === "accept") {
        const connRes = await getMyConnections();
        const conns = connRes?.data?.connections || [];
        setConnections(conns);
        setStats((prev) => ({ ...prev, connections: conns.length }));
      }
    } catch (err) {
      showToast(err?.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleCancelSent = async (connectionId) => {
    setActionLoading((prev) => ({ ...prev, [connectionId]: true }));
    try {
      await cancelPendingRequest(connectionId);
      showToast("Request withdrawn");
      setSentRequests((prev) => prev.filter((r) => r._id !== connectionId));
      setStats((prev) => ({ ...prev, sentRequests: Math.max(0, prev.sentRequests - 1) }));
    } catch (err) {
      showToast(err?.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [connectionId]: false }));
    }
  };

  const handleRemoveConnection = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this connection?")) return;
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      await removeConnection(userId);
      showToast("Connection removed");
      setConnections((prev) => prev.filter((c) => c._id !== userId));
      setStats((prev) => ({ ...prev, connections: Math.max(0, prev.connections - 1) }));
    } catch (err) {
      showToast(err?.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Follow Actions
  const handleFollowToggle = async (targetUser, isCurrentlyFollowing) => {
    const userId = targetUser._id;
    setActionLoading((prev) => ({ ...prev, [userId]: true }));
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId);
        setFollowing((prev) => prev.filter((u) => u._id !== userId));
        setStats((prev) => ({ ...prev, following: Math.max(0, prev.following - 1) }));
        showToast(`Unfollowed ${targetUser.name}`);
      } else {
        await followUser(userId);
        setFollowing((prev) => [...prev, targetUser]);
        setStats((prev) => ({ ...prev, following: prev.following + 1 }));
        showToast(`Now following ${targetUser.name}`);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || err.message, "error");
    } finally {
      setActionLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const isFollowingUser = (userId) => {
    return following.some((u) => u._id === userId);
  };

  return (
    <div className="network-page">
      <div className="network-container">
        {/* TOAST MESSAGE */}
        {message && (
          <div className={`network-toast ${message.type}`}>
            {message.type === "success" ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* HEADER & QUICK STATS */}
        <div className="network-header">
          <div className="network-header-text">
            <h1>Professional Network</h1>
            <p>Grow your circle, discover industry peers, and manage professional relationships</p>
          </div>
          <button
            type="button"
            className="network-refresh-btn"
            onClick={loadNetworkData}
            title="Refresh Network Data"
          >
            <RefreshCw size={16} />
            <span>Sync</span>
          </button>
        </div>

        {/* QUICK STATS PILLS */}
        <div className="network-stats-grid">
          <div
            className={`stat-card ${activeTab === "connections" ? "active" : ""}`}
            onClick={() => switchTab("connections")}
          >
            <div className="stat-icon connections-icon">
              <Users size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.connections}</span>
              <span className="stat-label">Connections</span>
            </div>
          </div>

          <div
            className={`stat-card ${activeTab === "followers" ? "active" : ""}`}
            onClick={() => switchTab("followers")}
          >
            <div className="stat-icon followers-icon">
              <UserCheck size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.followers}</span>
              <span className="stat-label">Followers</span>
            </div>
          </div>

          <div
            className={`stat-card ${activeTab === "following" ? "active" : ""}`}
            onClick={() => switchTab("following")}
          >
            <div className="stat-icon following-icon">
              <Sparkles size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.following}</span>
              <span className="stat-label">Following</span>
            </div>
          </div>

          <div
            className={`stat-card ${activeTab === "requests" ? "active" : ""}`}
            onClick={() => switchTab("requests")}
          >
            <div className="stat-icon requests-icon">
              <UserPlus size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-number">{stats.receivedRequests}</span>
              <span className="stat-label">Pending Invitations</span>
            </div>
          </div>
        </div>

        {/* SEARCH BAR & TAB NAVIGATION */}
        <div className="network-controls">
          <div className="network-tabs" role="tablist">
            <button
              type="button"
              className={`tab-btn ${activeTab === "connections" ? "active" : ""}`}
              onClick={() => switchTab("connections")}
            >
              <Users size={16} />
              <span>Connections ({stats.connections})</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "suggestions" ? "active" : ""}`}
              onClick={() => switchTab("suggestions")}
            >
              <Sparkles size={16} />
              <span>People You May Know</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => switchTab("requests")}
            >
              <UserPlus size={16} />
              <span>Received ({stats.receivedRequests})</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "sent" ? "active" : ""}`}
              onClick={() => switchTab("sent")}
            >
              <Send size={16} />
              <span>Sent ({stats.sentRequests})</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "followers" ? "active" : ""}`}
              onClick={() => switchTab("followers")}
            >
              <UserCheck size={16} />
              <span>Followers ({stats.followers})</span>
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "following" ? "active" : ""}`}
              onClick={() => switchTab("following")}
            >
              <Sparkles size={16} />
              <span>Following ({stats.following})</span>
            </button>
          </div>

          <div className="network-search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search members by name, role, skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* SEARCH RESULTS OVERLAY/SECTION IF SEARCHING */}
        {searchQuery.trim() && (
          <div className="search-results-section">
            <div className="section-title-row">
              <h2>
                Search Results for "<span>{searchQuery}</span>"
              </h2>
              <span className="results-count">{searchResults.length} people found</span>
            </div>

            {searching ? (
              <div className="network-loading-box">
                <Loader />
                <p>Searching professionals...</p>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="network-empty-box">
                <Users size={40} />
                <h3>No professionals found</h3>
                <p>Try searching for a different skill, headline, or name</p>
              </div>
            ) : (
              <div className="people-grid">
                {searchResults.map((person) => (
                  <PersonCard
                    key={person._id}
                    person={person}
                    isFollowing={isFollowingUser(person._id)}
                    isConnected={connections.some((c) => c._id === person._id)}
                    isPendingSent={sentRequests.some((r) => r.receiver?._id === person._id)}
                    isPendingReceived={receivedRequests.some((r) => r.sender?._id === person._id)}
                    isSelf={person._id === currentUser?._id}
                    loading={Boolean(actionLoading[person._id])}
                    onConnect={() => handleSendRequest(person._id)}
                    onFollowToggle={() => handleFollowToggle(person, isFollowingUser(person._id))}
                    onRemoveConnection={() => handleRemoveConnection(person._id)}
                  />
                ))}
              </div>
            )}
            <div className="search-divider" />
          </div>
        )}

        {/* MAIN TAB CONTENT */}
        {loading ? (
          <div className="network-loading-box">
            <Loader />
            <p>Loading your network...</p>
          </div>
        ) : (
          <div className="tab-content-area">
            {/* TAB: MY CONNECTIONS */}
            {activeTab === "connections" && (
              <div className="tab-pane">
                <div className="tab-pane-header">
                  <h2>My Professional Connections ({connections.length})</h2>
                  <p>People in your 1st-degree professional network</p>
                </div>

                {connections.length === 0 ? (
                  <div className="network-empty-box">
                    <Users size={48} />
                    <h3>No connections yet</h3>
                    <p>Expand your network by connecting with colleagues, peers, and industry leaders</p>
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => switchTab("suggestions")}
                    >
                      <Sparkles size={16} />
                      <span>Discover People You May Know</span>
                    </button>
                  </div>
                ) : (
                  <div className="people-grid">
                    {connections.map((person) => (
                      <PersonCard
                        key={person._id}
                        person={person}
                        isConnected={true}
                        isFollowing={isFollowingUser(person._id)}
                        loading={Boolean(actionLoading[person._id])}
                        onRemoveConnection={() => handleRemoveConnection(person._id)}
                        onFollowToggle={() => handleFollowToggle(person, isFollowingUser(person._id))}
                        onMessage={() => navigate(`/messages?user=${person._id}`)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SUGGESTIONS / PEOPLE YOU MAY KNOW */}
            {activeTab === "suggestions" && (
              <div className="tab-pane">
                <div className="tab-pane-header">
                  <h2>People You May Know</h2>
                  <p>Smart recommendations based on mutual connections, shared skills, and background</p>
                </div>

                {suggestions.length === 0 ? (
                  <div className="network-empty-box">
                    <Sparkles size={48} />
                    <h3>All caught up!</h3>
                    <p>No new suggestions available right now. Check back soon.</p>
                  </div>
                ) : (
                  <div className="people-grid">
                    {suggestions.map((person) => (
                      <PersonCard
                        key={person._id}
                        person={person}
                        isFollowing={isFollowingUser(person._id)}
                        isConnected={false}
                        isPendingSent={sentRequests.some((r) => r.receiver?._id === person._id)}
                        loading={Boolean(actionLoading[person._id])}
                        onConnect={() => handleSendRequest(person._id)}
                        onFollowToggle={() => handleFollowToggle(person, isFollowingUser(person._id))}
                        reasonBadge={person.reason}
                        mutualCount={person.mutualCount}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: RECEIVED REQUESTS */}
            {activeTab === "requests" && (
              <div className="tab-pane">
                <div className="tab-pane-header">
                  <h2>Pending Connection Requests ({receivedRequests.length})</h2>
                  <p>People who want to connect with you</p>
                </div>

                {receivedRequests.length === 0 ? (
                  <div className="network-empty-box">
                    <UserPlus size={48} />
                    <h3>No pending requests</h3>
                    <p>When someone invites you to connect, their request will appear here</p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {receivedRequests.map((reqItem) => {
                      const sender = reqItem.sender;
                      if (!sender) return null;
                      return (
                        <div key={reqItem._id} className="request-row-card">
                          <Link to={`/profile/${sender.username || sender._id}`} className="request-avatar">
                            {sender.profilePicture ? (
                              <img src={sender.profilePicture} alt={sender.name} />
                            ) : (
                              <span>{(sender.name || "U")[0].toUpperCase()}</span>
                            )}
                          </Link>

                          <div className="request-info">
                            <Link to={`/profile/${sender.username || sender._id}`} className="request-name">
                              {sender.name}
                            </Link>
                            <span className="request-headline">
                              {sender.headline || "Professional on JobSphere"}
                            </span>
                            {sender.location && (
                              <span className="request-location">
                                <MapPin size={12} /> {sender.location}
                              </span>
                            )}
                            <span className="request-date">
                              <Clock size={12} /> Received {new Date(reqItem.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="request-actions">
                            <button
                              type="button"
                              className="btn-accept"
                              disabled={Boolean(actionLoading[reqItem._id])}
                              onClick={() => handleRespond(reqItem._id, "accept")}
                            >
                              <CheckCircle size={16} />
                              <span>Accept</span>
                            </button>
                            <button
                              type="button"
                              className="btn-reject"
                              disabled={Boolean(actionLoading[reqItem._id])}
                              onClick={() => handleRespond(reqItem._id, "reject")}
                            >
                              <XCircle size={16} />
                              <span>Decline</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: SENT REQUESTS */}
            {activeTab === "sent" && (
              <div className="tab-pane">
                <div className="tab-pane-header">
                  <h2>Sent Requests ({sentRequests.length})</h2>
                  <p>Invitations you've sent that are awaiting response</p>
                </div>

                {sentRequests.length === 0 ? (
                  <div className="network-empty-box">
                    <Send size={48} />
                    <h3>No pending sent requests</h3>
                    <p>All connection requests you sent have been responded to</p>
                  </div>
                ) : (
                  <div className="requests-list">
                    {sentRequests.map((reqItem) => {
                      const receiver = reqItem.receiver;
                      if (!receiver) return null;
                      return (
                        <div key={reqItem._id} className="request-row-card">
                          <Link to={`/profile/${receiver.username || receiver._id}`} className="request-avatar">
                            {receiver.profilePicture ? (
                              <img src={receiver.profilePicture} alt={receiver.name} />
                            ) : (
                              <span>{(receiver.name || "U")[0].toUpperCase()}</span>
                            )}
                          </Link>

                          <div className="request-info">
                            <Link to={`/profile/${receiver.username || receiver._id}`} className="request-name">
                              {receiver.name}
                            </Link>
                            <span className="request-headline">
                              {receiver.headline || "Professional on JobSphere"}
                            </span>
                            <span className="request-date">
                              <Clock size={12} /> Sent {new Date(reqItem.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="request-actions">
                            <button
                              type="button"
                              className="btn-withdraw"
                              disabled={Boolean(actionLoading[reqItem._id])}
                              onClick={() => handleCancelSent(reqItem._id)}
                            >
                              Withdraw Request
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: FOLLOWERS */}
            {activeTab === "followers" && (
              <div className="tab-pane">
                <div className="tab-pane-header">
                  <h2>Followers ({followers.length})</h2>
                  <p>People who see your public posts in their feed</p>
                </div>

                {followers.length === 0 ? (
                  <div className="network-empty-box">
                    <UserCheck size={48} />
                    <h3>No followers yet</h3>
                    <p>Share interesting posts, career milestones, and projects to grow your followers</p>
                  </div>
                ) : (
                  <div className="people-grid">
                    {followers.map((person) => (
                      <PersonCard
                        key={person._id}
                        person={person}
                        isFollowing={isFollowingUser(person._id)}
                        isConnected={connections.some((c) => c._id === person._id)}
                        loading={Boolean(actionLoading[person._id])}
                        onFollowToggle={() => handleFollowToggle(person, isFollowingUser(person._id))}
                        onConnect={() => handleSendRequest(person._id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: FOLLOWING */}
            {activeTab === "following" && (
              <div className="tab-pane">
                <div className="tab-pane-header">
                  <h2>Following ({following.length})</h2>
                  <p>People whose public updates appear in your home feed</p>
                </div>

                {following.length === 0 ? (
                  <div className="network-empty-box">
                    <Sparkles size={48} />
                    <h3>Not following anyone yet</h3>
                    <p>Follow leaders and mentors in your industry to stay updated with their thoughts</p>
                  </div>
                ) : (
                  <div className="people-grid">
                    {following.map((person) => (
                      <PersonCard
                        key={person._id}
                        person={person}
                        isFollowing={true}
                        isConnected={connections.some((c) => c._id === person._id)}
                        loading={Boolean(actionLoading[person._id])}
                        onFollowToggle={() => handleFollowToggle(person, true)}
                        onConnect={() => handleSendRequest(person._id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* PERSON CARD COMPONENT */
const PersonCard = ({
  person,
  isConnected,
  isFollowing,
  isPendingSent,
  isPendingReceived,
  isSelf,
  loading,
  onConnect,
  onFollowToggle,
  onRemoveConnection,
  onMessage,
  reasonBadge,
  mutualCount
}) => {
  const profileUrl = `/profile/${person.username || person._id}`;

  return (
    <div className="person-card">
      <div className="person-card-header">
        <div className="person-avatar-wrap">
          <Link to={profileUrl} className="person-avatar">
            {person.profilePicture ? (
              <img src={person.profilePicture} alt={person.name} />
            ) : (
              <span>{(person.name || "U")[0].toUpperCase()}</span>
            )}
          </Link>
          {isConnected && <span className="connected-badge" title="1st Connection">1st</span>}
        </div>
      </div>

      <div className="person-card-body">
        <Link to={profileUrl} className="person-name">
          {person.name}
        </Link>
        <span className="person-headline">
          {person.headline || "Professional at JobSphere"}
        </span>

        {person.location && (
          <span className="person-location">
            <MapPin size={12} /> {person.location}
          </span>
        )}

        {/* Reason or mutual count */}
        {reasonBadge ? (
          <div className="person-reason-badge">
            <Sparkles size={12} />
            <span>{reasonBadge}</span>
          </div>
        ) : mutualCount > 0 ? (
          <div className="person-mutual-badge">
            <Users size={12} />
            <span>{mutualCount} mutual connection{mutualCount > 1 ? "s" : ""}</span>
          </div>
        ) : null}

        {/* Skills preview */}
        {Array.isArray(person.skills) && person.skills.length > 0 && (
          <div className="person-skills-row">
            {person.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className="person-skill-tag">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      {!isSelf && (
        <div className="person-card-actions">
          {isConnected ? (
            <>
              {onMessage && (
                <button
                  type="button"
                  className="btn-action-primary"
                  onClick={onMessage}
                >
                  <MessageSquare size={14} />
                  <span>Message</span>
                </button>
              )}
              <button
                type="button"
                className="btn-action-outline remove"
                disabled={loading}
                onClick={onRemoveConnection}
                title="Remove Connection"
              >
                <UserMinus size={14} />
                <span>Disconnect</span>
              </button>
            </>
          ) : isPendingSent ? (
            <button type="button" className="btn-action-disabled" disabled>
              <Clock size={14} />
              <span>Pending</span>
            </button>
          ) : isPendingReceived ? (
            <button
              type="button"
              className="btn-action-primary"
              onClick={onConnect}
              disabled={loading}
            >
              <CheckCircle size={14} />
              <span>Accept</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn-action-primary"
              disabled={loading}
              onClick={onConnect}
            >
              <UserPlus size={14} />
              <span>Connect</span>
            </button>
          )}

          {/* Follow/Unfollow Button */}
          {onFollowToggle && (
            <button
              type="button"
              className={`btn-follow-toggle ${isFollowing ? "following" : ""}`}
              disabled={loading}
              onClick={onFollowToggle}
            >
              {isFollowing ? "Following" : "+ Follow"}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default Network;
