import React from "react";
import { NavLink } from "react-router-dom";
import {
  Map,
  Compass,
  Zap,
  Target,
  Cpu,
  Award,
  BrainCircuit,
  SearchCode
} from "lucide-react";

const NAV_ITEMS = [
  { to: "/career", label: "Command Center", icon: Compass, end: true },
  { to: "/career-roadmap", label: "Career Roadmap", icon: Map },
  { to: "/career/skill-gap", label: "Skill Gap", icon: Target },
  { to: "/career/autopilot", label: "Autopilot", icon: Zap },
  { to: "/career/simulator", label: "Simulator", icon: Cpu },
  { to: "/skills/passport", label: "Skill Passport", icon: Award },
  { to: "/learning/ai", label: "Learning AI", icon: BrainCircuit },
];

const CareerSubNav = () => {
  return (
    <div className="career-subnav">
      <div className="career-subnav-links">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `career-nav-item ${isActive ? "active" : ""}`}
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};

export default CareerSubNav;
