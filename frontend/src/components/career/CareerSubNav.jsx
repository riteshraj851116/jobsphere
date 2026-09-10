import React from "react";
import { NavLink } from "react-router-dom";
import {
  Map,
  Compass,
  Zap,
  Target,
  Cpu,
  FolderGit2,
  Award,
  Radar,
  TrendingUp,
  BrainCircuit,
  SearchCode,
  Users,
} from "lucide-react";

const CareerSubNav = () => {
  return (
    <div className="career-subnav">
      <div className="career-subnav-links">
        <NavLink
          to="/career"
          end
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <Compass size={15} />
          <span>Command Center</span>
        </NavLink>

        <NavLink
          to="/career-roadmap"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <Map size={15} />
          <span>Career Roadmap</span>
        </NavLink>

        <NavLink
          to="/career/autopilot"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <Zap size={15} />
          <span>Autopilot</span>
        </NavLink>

        <NavLink
          to="/career/skill-gap"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <Target size={15} />
          <span>Skill Gap</span>
        </NavLink>

        <NavLink
          to="/career/simulator"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <Cpu size={15} />
          <span>Simulator</span>
        </NavLink>

        <NavLink
          to="/projects/ai-advisor"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <FolderGit2 size={15} />
          <span>Project Advisor</span>
        </NavLink>

        <NavLink
          to="/skills/passport"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <Award size={15} />
          <span>Skill Passport</span>
        </NavLink>

        <NavLink
          to="/jobs/analyze"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <SearchCode size={15} />
          <span>Job Analyzer</span>
        </NavLink>

        <NavLink
          to="/career/opportunities"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <Radar size={15} />
          <span>Opportunity Radar</span>
        </NavLink>

        <NavLink
          to="/career/market"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <TrendingUp size={15} />
          <span>Skill Demand</span>
        </NavLink>

        <NavLink
          to="/learning/ai"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <BrainCircuit size={15} />
          <span>Learning Agent</span>
        </NavLink>

        <NavLink
          to="/talent"
          className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
        >
          <Users size={15} />
          <span>Talent Hub</span>
        </NavLink>
      </div>
    </div>
  );
};

export default CareerSubNav;
