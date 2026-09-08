import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { RotateCcw, Moon, Sun, ZoomIn, ZoomOut, Check, Copy } from "lucide-react";

const MONACO_LANG_MAP = {
  javascript: "javascript",
  python: "python",
  java: "java",
  cpp: "cpp",
};

const CodeEditor = ({
  problemId,
  language,
  onLanguageChange,
  code,
  onCodeChange,
  starterCode,
  onRun,
  onSubmit,
  isRunning,
  isSubmitting,
}) => {
  const [theme, setTheme] = useState("light");
  const [fontSize, setFontSize] = useState(14);
  const [copied, setCopied] = useState(false);

  // Load draft code from localStorage if available
  useEffect(() => {
    if (problemId && language) {
      const draftKey = `dsa_draft_${problemId}_${language}`;
      const saved = localStorage.getItem(draftKey);
      if (saved && saved.trim() && saved !== code) {
        onCodeChange(saved);
      }
    }
  }, [problemId, language]);

  // Handle local code changes and persist to localStorage
  const handleEditorChange = (value) => {
    const val = value || "";
    onCodeChange(val);
    if (problemId && language) {
      localStorage.setItem(`dsa_draft_${problemId}_${language}`, val);
    }
  };

  // Reset to original starter code
  const handleReset = () => {
    const original = starterCode?.[language] || "";
    onCodeChange(original);
    if (problemId && language) {
      localStorage.setItem(`dsa_draft_${problemId}_${language}`, original);
    }
  };

  // Copy code to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Keyboard shortcut listener for Run & Submit
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (e.shiftKey) {
        if (!isSubmitting && onSubmit) onSubmit();
      } else {
        if (!isRunning && onRun) onRun();
      }
    }
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%" }}
      onKeyDown={handleKeyDown}
    >
      {/* Editor Toolbar */}
      <div className="editor-toolbar">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <select
            className="editor-lang-select"
            value={language}
            onChange={(e) => onLanguageChange(e.target.value)}
          >
            <option value="javascript">JavaScript (ES6+)</option>
            <option value="python">Python (3.x)</option>
            <option value="java">Java (OpenJDK 17)</option>
            <option value="cpp">C++ (GCC 11)</option>
          </select>

          <span style={{ fontSize: "0.75rem", color: "var(--dsa-text-muted)" }}>
            Ctrl+Enter (Run) | Ctrl+Shift+Enter (Submit)
          </span>
        </div>

        <div className="editor-tools-group">
          <button
            type="button"
            className="editor-tool-btn"
            onClick={() => setFontSize((s) => Math.min(22, s + 1))}
            title="Increase font size"
          >
            <ZoomIn size={14} />
          </button>

          <button
            type="button"
            className="editor-tool-btn"
            onClick={() => setFontSize((s) => Math.max(11, s - 1))}
            title="Decrease font size"
          >
            <ZoomOut size={14} />
          </button>

          <button
            type="button"
            className="editor-tool-btn"
            onClick={() => setTheme((t) => (t === "vs-dark" ? "light" : "vs-dark"))}
            title="Toggle theme (Light / Dark)"
          >
            {theme === "vs-dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          <button
            type="button"
            className="editor-tool-btn"
            onClick={handleCopy}
            title="Copy code"
          >
            {copied ? <Check size={14} color="#222222" /> : <Copy size={14} />}
          </button>

          <button
            type="button"
            className="editor-tool-btn"
            onClick={handleReset}
            title="Reset to starter code"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Monaco Editor Canvas */}
      <div className="monaco-editor-wrapper" style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={MONACO_LANG_MAP[language] || "javascript"}
          theme={theme}
          value={code}
          onChange={handleEditorChange}
          options={{
            fontSize,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
            lineNumbers: "on",
            cursorBlinking: "smooth",
            smoothScrolling: true,
            padding: { top: 12, bottom: 12 },
            suggestOnTriggerCharacters: true,
            fontFamily: "'Fira Code', 'Cascadia Code', Consolas, monospace",
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
