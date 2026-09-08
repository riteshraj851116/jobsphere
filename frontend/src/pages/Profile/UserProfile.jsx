import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  MessageSquare,
  MapPin,
  Globe,
  Briefcase,
  GraduationCap,
  Sparkles,
  Rocket,
  ExternalLink,
  ShieldAlert,
  CheckCircle,
  Clock,
  MoreVertical,
  Flag,
  Ban,
  Share2,
  Heart,
  MessageCircle,
  Repeat,
  Bookmark
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getUserProfile,
  getUserById,
  followUser,
  unfollowUser,
  blockUser,
  submitReport
} from "../../services/userService";
import {
  getConnectionStatus,
  sendConnectionRequest,
  cancelPendingRequest,
  respondToRequest,
  removeConnection,
  getMutualConnections
} from "../../services/connectionService";
import { getUserPosts, likePost } from "../../services/postService";
import Loader from "../../components/common/Loader";
import "./UserProfile.css";

const UserProfile = () => {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);

  // Relationship State
  const [relationship, setRelationship] = useState({
    isSelf: false,
    connectionStatus: "none", // none, pending_sent, pending_received, connected, self
    connectionId: null,
    isFollowing: false,
    isFollower: false,
    isBlocked: false,
    mutualCount: 0,
    mutualUsers: []
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const showToast = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  // Load profile data
  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      let userData = null;

      // If parameter is 24 hex characters, try getUserById first
      if (/^[0-9a-fA-F]{24}$/.test(username)) {
        const idRes = await getUserById(username);
        userData = idRes?.data?.user || idRes?.user;
      }

      if (!userData) {
        const profileRes = await getUserProfile(username);
        userData = profileRes?.data?.user || profileRes?.user;
      }

      if (!userData) {
        throw new Error("User not found");
      }

      setProfile(userData);

      const isSelf = currentUser?._id && userData._id === currentUser._id;

      if (isSelf) {
        setRelationship({
          isSelf: true,
          connectionStatus: "self",
          isFollowing: false,
          isFollower: false,
          mutualCount: 0,
          mutualUsers: []
        });
      } else if (currentUser?._id && userData._id) {
        // Fetch fresh relationship status and mutual connections
        try {
          const [statusRes, mutualRes] = await Promise.allSettled([
            getConnectionStatus(userData._id),
            getMutualConnections(userData._id)
          ]);

          if (statusRes.status === "fulfilled") {
            const sData = statusRes.value?.data || {};
            setRelationship((prev) => ({
              ...prev,
              isSelf: false,
              connectionStatus: sData.connectionStatus || "none",
              connectionId: sData.connectionId || null,
              isFollowing: Boolean(sData.isFollowing),
              isFollower: Boolean(sData.isFollower),
              isBlocked: Boolean(sData.isBlocked),
              mutualCount: sData.mutualCount || 0,
              mutualUsers: sData.mutualUsers || []
            }));
          }

          if (mutualRes.status === "fulfilled") {
            const mList = mutualRes.value?.data?.mutualConnections || [];
            setRelationship((prev) => ({
              ...prev,
              mutualCount: mList.length,
              mutualUsers: mList
            }));
          }
        } catch (err) {
          console.warn("Relationship lookup failed", err);
        }
      }

      // Load User's Posts
      if (userData._id) {
        setLoadingPosts(true);
        try {
          const postsRes = await getUserPosts(userData._id);
          setUserPosts(postsRes?.data?.posts || postsRes?.posts || []);
        } catch (e) {
          console.warn("User posts load failed", e);
        } finally {
          setLoadingPosts(false);
        }
      }
    } catch (err) {
      console.error("Profile load error", err);
      showToast(err?.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [username, currentUser?._id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Connection Actions
  const handleConnect = async () => {
    if (!profile?._id) return;
    setActionLoading(true);
    try {
      await sendConnectionRequest(profile._id);
      setRelationship((prev) => ({ ...prev, connectionStatus: "pending_sent" }));
      showToast("Connection request sent!");
    } catch (err) {
      showToast(err?.response?.data?.message || "Failed to send request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!relationship.connectionId && !profile?._id) return;
    setActionLoading(true);
    try {
      await cancelPendingRequest(relationship.connectionId || profile._id);
      setRelationship((prev) => ({ ...prev, connectionStatus: "none", connectionId: null }));
      showToast("Connection request withdrawn");
    } catch (err) {
      showToast("Failed to withdraw request", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!relationship.connectionId && !profile?._id) return;
    setActionLoading(true);
    try {
      await respondToRequest(relationship.connectionId || profile._id, "accept");
      setRelationship((prev) => ({ ...prev, connectionStatus: "connected" }));
      showToast("You are now connected!");
    } catch (err) {
      showToast("Failed to accept connection", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm(`Are you sure you want to remove ${profile?.name} from your connections?`)) return;
    setActionLoading(true);
    try {
      await removeConnection(profile._id);
      setRelationship((prev) => ({ ...prev, connectionStatus: "none" }));
      showToast("Connection removed");
    } catch (err) {
      showToast("Failed to remove connection", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Follow Action
  const handleFollowToggle = async () => {
    if (!profile?._id) return;
    setActionLoading(true);
    try {
      if (relationship.isFollowing) {
        await unfollowUser(profile._id);
        setRelationship((prev) => ({ ...prev, isFollowing: false }));
        setProfile((prev) => ({
          ...prev,
          followerCount: Math.max(0, (prev.followerCount || 1) - 1)
        }));
        showToast(`Unfollowed ${profile.name}`);
      } else {
        await followUser(profile._id);
        setRelationship((prev) => ({ ...prev, isFollowing: true }));
        setProfile((prev) => ({
          ...prev,
          followerCount: (prev.followerCount || 0) + 1
        }));
        showToast(`Now following ${profile.name}`);
      }
    } catch (err) {
      showToast(err?.response?.data?.message || "Follow toggle failed", "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Block Action
  const handleBlockUser = async () => {
    if (!window.confirm(`Are you sure you want to block ${profile?.name}? You will no longer see each other's posts or connections.`)) return;
    try {
      await blockUser(profile._id);
      showToast("User blocked");
      navigate("/network");
    } catch (err) {
      showToast("Failed to block user", "error");
    }
  };

  // Report Action
  const handleReportUser = async () => {
    const reason = window.prompt("Please provide a reason for reporting this profile:");
    if (!reason) return;
    try {
      await submitReport({
        targetType: "user",
        targetId: profile._id,
        reason: reason.trim()
      });
      showToast("Report submitted. Our safety team will review it.");
    } catch (err) {
      showToast("Failed to submit report", "error");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-screen">
        <Loader />
        <p>Loading professional profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="profile-not-found-screen">
        <ShieldAlert size={48} />
        <h2>Profile Not Found</h2>
        <p>The profile you are looking for does not exist or may have been removed.</p>
        <Link to="/network" className="btn-primary">
          Back to Network
        </Link>
      </div>
    );
  }

  const hasExperience = Array.isArray(profile.experience) && profile.experience.length > 0;
  const hasEducation = Array.isArray(profile.education) && profile.education.length > 0;
  const hasSkills = Array.isArray(profile.skills) && profile.skills.length > 0;
  const hasProjects = Array.isArray(profile.projects) && profile.projects.length > 0;

  return (
    <div className="user-profile-page">
      <div className="user-profile-container">
        {/* TOAST NOTIFICATION */}
        {message && (
          <div className={`profile-toast ${message.type}`}>
            {message.type === "success" ? <CheckCircle size={18} /> : <ShieldAlert size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        {/* HERO BANNER & AVATAR CARD */}
        <div className="profile-hero-card">
          <div
            className="profile-cover-wrap"
            style={
              profile.coverPicture
                ? { backgroundImage: `url(${profile.coverPicture})` }
                : undefined
            }
          />

          <div className="profile-hero-content">
            <div className="profile-avatar-row">
              <div className="profile-avatar-large">
                {profile.profilePicture ? (
                  <img src={profile.profilePicture} alt={profile.name} />
                ) : (
                  <span>{(profile.name || "U")[0].toUpperCase()}</span>
                )}
              </div>

              {/* Relationship Action Buttons */}
              <div className="profile-action-buttons">
                {relationship.isSelf ? (
                  <Link to="/profile" className="btn-edit-profile">
                    Edit Profile
                  </Link>
                ) : (
                  <>
                    {/* Connection Button */}
                    {relationship.connectionStatus === "connected" ? (
                      <button
                        type="button"
                        className="btn-connected-state"
                        onClick={handleDisconnect}
                        disabled={actionLoading}
                        title="Click to remove connection"
                      >
                        <UserCheck size={16} />
                        <span>Connected</span>
                      </button>
                    ) : relationship.connectionStatus === "pending_sent" ? (
                      <button
                        type="button"
                        className="btn-pending-withdraw"
                        onClick={handleWithdraw}
                        disabled={actionLoading}
                      >
                        <Clock size={16} />
                        <span>Pending (Withdraw)</span>
                      </button>
                    ) : relationship.connectionStatus === "pending_received" ? (
                      <button
                        type="button"
                        className="btn-accept-request"
                        onClick={handleAccept}
                        disabled={actionLoading}
                      >
                        <UserPlus size={16} />
                        <span>Accept Request</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="btn-connect-primary"
                        onClick={handleConnect}
                        disabled={actionLoading}
                      >
                        <UserPlus size={16} />
                        <span>Connect</span>
                      </button>
                    )}

                    {/* Follow Button */}
                    <button
                      type="button"
                      className={`btn-follow-primary ${relationship.isFollowing ? "following" : ""}`}
                      onClick={handleFollowToggle}
                      disabled={actionLoading}
                    >
                      {relationship.isFollowing ? (
                        <>
                          <UserCheck size={16} />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={16} />
                          <span>Follow</span>
                        </>
                      )}
                    </button>

                    {/* Message Button */}
                    <button
                      type="button"
                      className="btn-message-primary"
                      onClick={() => navigate(`/messages?userId=${profile._id}`, { state: { targetUser: profile } })}
                    >
                      <MessageSquare size={16} />
                      <span>Message</span>
                    </button>

                    {/* More Menu Dropdown */}
                    <div className="profile-more-menu-wrap">
                      <button
                        type="button"
                        className="btn-more-icon"
                        onClick={() => setMenuOpen(!menuOpen)}
                      >
                        <MoreVertical size={16} />
                      </button>

                      {menuOpen && (
                        <div className="profile-dropdown-box">
                          <button
                            type="button"
                            className="dropdown-item report"
                            onClick={() => {
                              setMenuOpen(false);
                              handleReportUser();
                            }}
                          >
                            <Flag size={14} />
                            <span>Report Profile</span>
                          </button>
                          <button
                            type="button"
                            className="dropdown-item block"
                            onClick={() => {
                              setMenuOpen(false);
                              handleBlockUser();
                            }}
                          >
                            <Ban size={14} />
                            <span>Block Member</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Profile Info Row */}
            <div className="profile-details-main">
              <div className="profile-name-badges">
                <h1>{profile.name}</h1>
                {profile.role === "recruiter" && (
                  <span className="profile-badge recruiter">Recruiter</span>
                )}
              </div>

              <span className="profile-handle">@{profile.username}</span>

              {profile.headline && (
                <p className="profile-headline-text">{profile.headline}</p>
              )}

              <div className="profile-meta-row">
                {profile.location && (
                  <span className="meta-item">
                    <MapPin size={15} />
                    <span>{profile.location}</span>
                  </span>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noreferrer"
                    className="meta-item link"
                  >
                    <Globe size={15} />
                    <span>Website</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>

              {/* Social Stats */}
              <div className="profile-stats-row">
                <div className="stat-pill">
                  <strong>{profile.connectionCount || (profile.connections || []).length}</strong>
                  <span>connections</span>
                </div>
                <div className="stat-pill">
                  <strong>{profile.followerCount || (profile.followers || []).length}</strong>
                  <span>followers</span>
                </div>
                <div className="stat-pill">
                  <strong>{profile.followingCount || (profile.following || []).length}</strong>
                  <span>following</span>
                </div>
              </div>

              {/* Mutual Connections Banner */}
              {relationship.mutualCount > 0 && (
                <div className="mutual-connections-banner">
                  <Users size={16} />
                  <span>
                    <strong>{relationship.mutualCount} mutual connection{relationship.mutualCount > 1 ? "s" : ""}:</strong>{" "}
                    {relationship.mutualUsers.slice(0, 2).map((u) => u.name).join(", ")}
                    {relationship.mutualCount > 2 && ` and ${relationship.mutualCount - 2} others`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PROFILE TABS */}
        <div className="profile-tabs-bar">
          <button
            type="button"
            className={`tab-item ${activeTab === "posts" ? "active" : ""}`}
            onClick={() => setActiveTab("posts")}
          >
            <span>Posts ({userPosts.length})</span>
          </button>
          {profile.bio && (
            <button
              type="button"
              className={`tab-item ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              <span>About</span>
            </button>
          )}
          {hasExperience && (
            <button
              type="button"
              className={`tab-item ${activeTab === "experience" ? "active" : ""}`}
              onClick={() => setActiveTab("experience")}
            >
              <span>Experience</span>
            </button>
          )}
          {hasEducation && (
            <button
              type="button"
              className={`tab-item ${activeTab === "education" ? "active" : ""}`}
              onClick={() => setActiveTab("education")}
            >
              <span>Education</span>
            </button>
          )}
          {hasSkills && (
            <button
              type="button"
              className={`tab-item ${activeTab === "skills" ? "active" : ""}`}
              onClick={() => setActiveTab("skills")}
            >
              <span>Skills</span>
            </button>
          )}
          {hasProjects && (
            <button
              type="button"
              className={`tab-item ${activeTab === "projects" ? "active" : ""}`}
              onClick={() => setActiveTab("projects")}
            >
              <span>Projects</span>
            </button>
          )}
        </div>

        {/* TAB PANELS */}
        <div className="profile-tab-panel">
          {/* POSTS TAB */}
          {activeTab === "posts" && (
            <div className="posts-tab-content">
              {loadingPosts ? (
                <div className="tab-loading-box">
                  <Loader />
                  <p>Loading member updates...</p>
                </div>
              ) : userPosts.length === 0 ? (
                <div className="tab-empty-box">
                  <Sparkles size={40} />
                  <h3>No posts published yet</h3>
                  <p>{profile.name} hasn't shared any updates recently.</p>
                </div>
              ) : (
                <div className="profile-posts-stream">
                  {userPosts.map((post) => (
                    <div key={post._id} className="profile-post-card">
                      <div className="post-time-row">
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.postType && (
                          <span className="badge-post-type">{post.postType}</span>
                        )}
                      </div>
                      <p className="post-text-snippet">{post.content}</p>
                      {post.image && (
                        <div className="post-img-preview">
                          <img src={post.image} alt="Attachment" />
                        </div>
                      )}
                      <div className="post-interactions-row">
                        <span>{post.likeCount || (post.likes || []).length} likes</span>
                        <span>•</span>
                        <span>{post.commentCount || (post.comments || []).length} comments</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === "about" && (
            <div className="section-card">
              <h3>About {profile.name}</h3>
              <p className="bio-paragraph">{profile.bio}</p>
            </div>
          )}

          {/* EXPERIENCE TAB */}
          {activeTab === "experience" && hasExperience && (
            <div className="section-card">
              <h3>Professional Experience</h3>
              <div className="timeline-list">
                {profile.experience.map((exp, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-icon">
                      <Briefcase size={16} />
                    </div>
                    <div className="timeline-content">
                      <h4>{exp.position}</h4>
                      <span className="company-name">{exp.company}</span>
                      {exp.location && (
                        <span className="timeline-location">{exp.location}</span>
                      )}
                      {exp.description && (
                        <p className="timeline-desc">{exp.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* EDUCATION TAB */}
          {activeTab === "education" && hasEducation && (
            <div className="section-card">
              <h3>Education</h3>
              <div className="timeline-list">
                {profile.education.map((edu, idx) => (
                  <div key={idx} className="timeline-item">
                    <div className="timeline-icon education">
                      <GraduationCap size={16} />
                    </div>
                    <div className="timeline-content">
                      <h4>{edu.institution}</h4>
                      <span className="degree-field">
                        {edu.degree} {edu.field && `in ${edu.field}`}
                      </span>
                      {(edu.startYear || edu.endYear) && (
                        <span className="edu-years">
                          {edu.startYear} - {edu.endYear || "Present"}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SKILLS TAB */}
          {activeTab === "skills" && hasSkills && (
            <div className="section-card">
              <h3>Skills & Endorsements</h3>
              <div className="skills-chips-cloud">
                {profile.skills.map((skill, idx) => (
                  <span key={idx} className="skill-chip-pill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS TAB */}
          {activeTab === "projects" && hasProjects && (
            <div className="section-card">
              <h3>Featured Projects</h3>
              <div className="projects-cards-grid">
                {profile.projects.map((proj, idx) => (
                  <div key={idx} className="project-grid-card">
                    <h4>{proj.title}</h4>
                    {proj.description && <p>{proj.description}</p>}
                    {Array.isArray(proj.technologies) && (
                      <div className="project-tech-tags">
                        {proj.technologies.map((t, i) => (
                          <span key={i} className="tech-tag">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="project-links-row">
                      {proj.link && (
                        <a
                          href={proj.link}
                          target="_blank"
                          rel="noreferrer"
                          className="project-link"
                        >
                          <span>Live Demo</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                      {proj.github && (
                        <a
                          href={proj.github}
                          target="_blank"
                          rel="noreferrer"
                          className="project-link github"
                        >
                          <span>Code Repository</span>
                          <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
