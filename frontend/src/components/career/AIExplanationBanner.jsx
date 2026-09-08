import React from "react";
import { Sparkles } from "lucide-react";

const AIExplanationBanner = ({ title = "Why this recommendation?", text, points = [] }) => {
  if (!text && (!points || points.length === 0)) return null;

  return (
    <div className="why-this-banner">
      <Sparkles size={18} color="#a78bfa" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <div className="why-this-title">{title}</div>
        {text && <p className="why-this-text">{text}</p>}
        {points && points.length > 0 && (
          <ul style={{ margin: "0.4rem 0 0", paddingLeft: "1.2rem", fontSize: "0.85rem", color: "#94a3b8" }}>
            {points.map((p, idx) => (
              <li key={idx} style={{ marginBottom: 4 }}>{p}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AIExplanationBanner;
