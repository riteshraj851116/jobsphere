import React, { useEffect, useState, useTransition } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  Clock,
  Circle,
  Bookmark,
  Shuffle,
  Filter,
  Layers,
} from "lucide-react";
import DsaSubNav from "../../components/dsa/DsaSubNav";
import dsaService from "../../services/dsaService";
import { useAuth } from "../../hooks/useAuth";
import "./dsa.css";

const ALL_TOPICS = [
  "All",
  "Arrays",
  "Strings",
  "Hashing",
  "Two Pointers",
  "Sliding Window",
  "Stack",
  "Queue",
  "Linked List",
  "Binary Search",
  "Trees",
  "BST",
  "Heap",
  "Graph",
  "Greedy",
  "Recursion",
  "Backtracking",
  "Dynamic Programming",
  "Bit Manipulation",
  "Sorting",
];

const ProblemList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "All");
  const [topic, setTopic] = useState(searchParams.get("topic") || "All");
  const [status, setStatus] = useState(searchParams.get("status") || "All");
  const [page, setPage] = useState(Number(searchParams.get("page")) || 1);

  // Data states
  const [problems, setProblems] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1, limit: 20 });
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Load problems on filter change
  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const query = {
      page,
      limit: 20,
    };
    if (search.trim()) query.search = search.trim();
    if (difficulty !== "All") query.difficulty = difficulty;
    if (topic !== "All") query.topic = topic;
    if (status !== "All") query.status = status;

    dsaService
      .getProblems(query)
      .then((res) => {
        if (isMounted && res.success) {
          setProblems(res.data.problems || []);
          setPagination(res.data.pagination || { total: 0, totalPages: 1, page: 1, limit: 20 });
        }
      })
      .catch((err) => console.error("Error fetching problems:", err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [search, difficulty, topic, status, page, user]);

  const handleBookmarkToggle = async (problemId, currentStatus) => {
    if (!user) {
      alert("Please login to save bookmarks.");
      return;
    }

    try {
      const res = await dsaService.toggleBookmark(problemId);
      if (res.success) {
        setProblems((prev) =>
          prev.map((p) =>
            p._id === problemId ? { ...p, isBookmarked: res.isBookmarked } : p
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    }
  };

  const renderStatusIcon = (userStatus) => {
    if (userStatus === "Solved") {
      return (
        <span title="Solved" className="dsa-status-icon-solved">
          <CheckCircle2 size={18} />
        </span>
      );
    }
    if (userStatus === "Attempted") {
      return (
        <span title="Attempted" className="dsa-status-icon-attempted">
          <Clock size={18} />
        </span>
      );
    }
    return (
      <span title="Unsolved" style={{ color: "var(--dsa-text-muted)" }}>
        <Circle size={16} strokeWidth={1.5} />
      </span>
    );
  };

  return (
    <div className="dsa-container">
      <div className="dsa-content-limit">
        {/* Navigation */}
        <DsaSubNav />

        {/* Page Title */}
        <div style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ margin: "0 0 0.5rem", fontSize: "1.75rem", color: "var(--dsa-text-primary)" }}>
            DSA Problem Set
          </h1>
          <p style={{ margin: 0, color: "var(--dsa-text-secondary)", fontSize: "0.9rem" }}>
            Curated coding interview challenges across major data structures and algorithms.
          </p>
        </div>

        {/* Filters Bar */}
        <div className="dsa-filter-bar">
          {/* Search Box */}
          <div className="dsa-search-wrapper">
            <Search size={16} color="var(--dsa-text-muted)" />
            <input
              type="text"
              placeholder="Search problems by name, number, or topic..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="dsa-search-input"
            />
          </div>

          {/* Dropdown Filters */}
          <div className="dsa-select-filters">
            {/* Difficulty */}
            <select
              className="dsa-select"
              value={difficulty}
              onChange={(e) => {
                setDifficulty(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Topic */}
            <select
              className="dsa-select"
              value={topic}
              onChange={(e) => {
                setTopic(e.target.value);
                setPage(1);
              }}
            >
              {ALL_TOPICS.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "All Topics" : t}
                </option>
              ))}
            </select>

            {/* Status (User Specific) */}
            {user && (
              <select
                className="dsa-select"
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="All">All Statuses</option>
                <option value="Solved">Solved</option>
                <option value="Attempted">Attempted</option>
                <option value="Unsolved">Unsolved</option>
                <option value="Bookmarked">Bookmarked</option>
              </select>
            )}
          </div>
        </div>

        {/* Problems Table */}
        <div className="dsa-table-card">
          {loading ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--dsa-text-secondary)" }}>
              Loading DSA problems...
            </div>
          ) : problems.length === 0 ? (
            <div style={{ textAlign: "center", padding: "3rem", color: "var(--dsa-text-muted)" }}>
              No problems match your current search and filter criteria.
            </div>
          ) : (
            <table className="dsa-table">
              <thead>
                <tr>
                  <th style={{ width: 45 }}>Status</th>
                  <th style={{ width: 60 }}>#</th>
                  <th>Title</th>
                  <th style={{ width: 110 }}>Difficulty</th>
                  <th>Topics</th>
                  <th style={{ width: 110 }}>Acceptance</th>
                  <th style={{ width: 50 }}>Save</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((p) => {
                  const acceptanceRate =
                    p.totalSubmissions > 0
                      ? `${Math.round((p.totalAccepted / p.totalSubmissions) * 100)}%`
                      : "68%"; // default reasonable rate

                  return (
                    <tr key={p._id}>
                      <td style={{ textAlign: "center" }}>
                        {renderStatusIcon(p.userStatus)}
                      </td>
                      <td style={{ color: "var(--dsa-text-muted)", fontWeight: 500 }}>
                        {p.problemNumber}
                      </td>
                      <td>
                        <Link
                          to={`/dsa/problems/${p.slug}`}
                          className="dsa-problem-link"
                        >
                          {p.title}
                        </Link>
                      </td>
                      <td>
                        <span
                          className={
                            p.difficulty === "Easy"
                              ? "dsa-badge-easy"
                              : p.difficulty === "Medium"
                              ? "dsa-badge-medium"
                              : "dsa-badge-hard"
                          }
                        >
                          {p.difficulty}
                        </span>
                      </td>
                      <td>
                        {p.topics?.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="dsa-topic-pill">
                            {t}
                          </span>
                        ))}
                      </td>
                      <td style={{ color: "var(--dsa-text-secondary)", fontSize: "0.825rem" }}>
                        {acceptanceRate}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleBookmarkToggle(p._id, p.isBookmarked)}
                          className="editor-tool-btn"
                          title={p.isBookmarked ? "Remove bookmark" : "Save bookmark"}
                        >
                          <Bookmark
                            size={16}
                            color={p.isBookmarked ? "#333333" : "var(--dsa-text-muted)"}
                            fill={p.isBookmarked ? "#333333" : "none"}
                          />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="dsa-pagination">
              <span style={{ fontSize: "0.8rem", color: "var(--dsa-text-muted)", marginRight: 8 }}>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>

              <button
                type="button"
                className="dsa-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>

              <button
                type="button"
                className="dsa-page-btn"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProblemList;
