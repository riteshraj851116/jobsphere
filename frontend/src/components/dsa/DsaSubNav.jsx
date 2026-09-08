import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Code2,
  ListOrdered,
  BookOpen,
  Layers,
  Flame,
  Shuffle,
  Sparkles,
} from "lucide-react";
import dsaService from "../../services/dsaService";
import { useAuth } from "../../hooks/useAuth";

const DsaSubNav = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (user) {
      dsaService
        .getUserProgress()
        .then((res) => {
          if (res.success && res.data?.streak?.currentStreak) {
            setStreak(res.data.streak.currentStreak);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleRandomProblem = async () => {
    try {
      const res = await dsaService.getProblems({ limit: 50 });
      if (res.success && res.data?.problems?.length > 0) {
        const list = res.data.problems;
        const randomItem = list[Math.floor(Math.random() * list.length)];
        navigate(`/dsa/problems/${randomItem.slug}`);
      }
    } catch {
      navigate("/dsa/problems");
    }
  };

  return (
    <div className="dsa-subnav">
      <div className="dsa-subnav-links">
        <NavLink
          to="/dsa"
          end
          className={({ isActive }) =>
            `dsa-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Code2 size={16} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/dsa/problems"
          className={({ isActive }) =>
            `dsa-nav-item ${isActive ? "active" : ""}`
          }
        >
          <ListOrdered size={16} />
          <span>Problems</span>
        </NavLink>

        <NavLink
          to="/dsa/sheet"
          className={({ isActive }) =>
            `dsa-nav-item ${isActive ? "active" : ""}`
          }
        >
          <BookOpen size={16} />
          <span>DSA Sheet</span>
        </NavLink>

        <NavLink
          to="/dsa/topics"
          className={({ isActive }) =>
            `dsa-nav-item ${isActive ? "active" : ""}`
          }
        >
          <Layers size={16} />
          <span>Topics</span>
        </NavLink>
      </div>

      <div className="dsa-subnav-right">
        {user && streak > 0 && (
          <div className="dsa-streak-badge" title="Daily coding streak">
            <Flame size={15} color="#ff7849" fill="#ff7849" />
            <span>{streak} Day Streak</span>
          </div>
        )}

        <button
          onClick={handleRandomProblem}
          className="dsa-nav-item"
          title="Pick a random problem to solve"
          style={{ cursor: "pointer", border: "none" }}
        >
          <Shuffle size={14} />
          <span>Pick Random</span>
        </button>
      </div>
    </div>
  );
};

export default DsaSubNav;
