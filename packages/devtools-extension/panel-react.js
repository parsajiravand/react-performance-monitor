// React-based DevTools panel
import React, { useState, useEffect, useMemo } from "react";
import { createRoot } from "react-dom/client";

// DevTools panel root
const container = document.getElementById("root");
const root = createRoot(container);

// Panel state
const Panel = () => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [filter, setFilter] = useState("all"); // all, interactions, renders, network, longtasks
  const [isRecording, setIsRecording] = useState(true);
  const [maxItems, setMaxItems] = useState(50);
  const [showInfo, setShowInfo] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // Connect to background service worker
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "rpm-devtools" });

    port.onMessage.addListener((message) => {
      if (message.type === "RPM_SESSION" && message.payload) {
        setCurrentSession(message.payload);
        setSessions((prev) => [
          message.payload,
          ...prev.slice(0, maxItems - 1),
        ]);
      } else if (message.type === "RPM_SESSION_UPDATE" && message.payload) {
        // Update current session with new render/network/long task data
        setCurrentSession(message.payload);
        // Also update the session in the sessions array
        setSessions((prev) =>
          prev.map((session) =>
            session.id === message.payload.id ? message.payload : session,
          ),
        );
      } else if (message.type === "RPM_RENDER" && message.payload) {
        // Handle render events
        console.log("Render:", message.payload);
        setCurrentSession((current) => {
          if (!current) return current;
          const updated = {
            ...current,
            renders: [...current.renders, message.payload],
            endTime: Math.max(current.endTime, message.payload.commitTime),
          };
          // Update in sessions array too
          setSessions((prev) =>
            prev.map((session) =>
              session.id === current.id ? updated : session,
            ),
          );
          return updated;
        });
      } else if (message.type === "RPM_NETWORK" && message.payload) {
        // Handle network events
        console.log("Network:", message.payload);
        setCurrentSession((current) => {
          if (!current) return current;
          const updated = {
            ...current,
            network: [...current.network, message.payload],
            endTime: Math.max(current.endTime, message.payload.endTime),
          };
          // Update in sessions array too
          setSessions((prev) =>
            prev.map((session) =>
              session.id === current.id ? updated : session,
            ),
          );
          return updated;
        });
      } else if (message.type === "RPM_LONG_TASK" && message.payload) {
        // Handle long task events
        console.log("Long task:", message.payload);
        setCurrentSession((current) => {
          if (!current) return current;
          const updated = {
            ...current,
            longTasks: [...current.longTasks, message.payload],
            endTime: Math.max(
              current.endTime,
              message.payload.startTime + message.payload.duration,
            ),
          };
          // Update in sessions array too
          setSessions((prev) =>
            prev.map((session) =>
              session.id === current.id ? updated : session,
            ),
          );
          return updated;
        });
      }
    });

    port.postMessage({ type: "RPM_PANEL_READY" });

    return () => port.disconnect();
  }, [maxItems]);

  const filteredItems = useMemo(() => {
    if (!currentSession) return [];

    const items = [];
    const baseTime = currentSession.startTime;

    // Add interaction
    if (
      currentSession.interaction &&
      (filter === "all" || filter === "interactions")
    ) {
      items.push({
        id: `interaction-${currentSession.interaction.startTime}`,
        type: "interaction",
        label: currentSession.interaction.id,
        time: 0,
        duration: currentSession.endTime
          ? currentSession.endTime - baseTime
          : 0,
        details: currentSession.interaction.type,
      });
    }

    // Add renders
    if (filter === "all" || filter === "renders") {
      currentSession.renders.forEach((render, index) => {
        items.push({
          id: `render-${index}`,
          type: "render",
          label: render.component,
          time: render.startTime - baseTime,
          duration: render.actualDuration,
          details: `phase: ${render.phase}`,
        });
      });
    }

    // Add network calls
    if (filter === "all" || filter === "network") {
      currentSession.network.forEach((entry, index) => {
        items.push({
          id: `network-${index}`,
          type: "network",
          label: entry.url,
          time: entry.startTime - baseTime,
          duration: entry.duration,
          details: `${entry.method} • ${entry.status}`,
        });
      });
    }

    // Add long tasks
    if (filter === "all" || filter === "longtasks") {
      currentSession.longTasks.forEach((entry, index) => {
        items.push({
          id: `longtask-${index}`,
          type: "longtask",
          label: entry.name || "Long Task",
          time: entry.startTime - baseTime,
          duration: entry.duration,
          details: `${entry.duration.toFixed(1)}ms`,
        });
      });
    }

    return items.sort((a, b) => a.time - b.time);
  }, [currentSession, filter]);

  const clearData = () => {
    setSessions([]);
    setCurrentSession(null);
  };

  const exportData = () => {
    const data = {
      sessions,
      currentSession,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rpm-performance-data-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%)",
      }}
    >
      {/* Compact Header */}
      <div
        style={{
          padding: "8px 12px",
          background: "rgba(30, 30, 46, 0.8)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(75, 85, 99, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexShrink: 0,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "24px",
              height: "24px",
              background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
              borderRadius: "6px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(59, 130, 246, 0.3)",
            }}
          >
            <span
              style={{ fontSize: "12px", fontWeight: "bold", color: "white" }}
            >
              ⚡
            </span>
          </div>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "14px",
                fontWeight: "600",
                background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              RPM
            </h1>
            <div
              style={{
                fontSize: "9px",
                color: "#9ca3af",
                marginTop: "1px",
              }}
            >
              DevTools
            </div>
          </div>
          <div
            style={{
              padding: "2px 8px",
              background: isRecording
                ? "linear-gradient(135deg, #10b981, #059669)"
                : "linear-gradient(135deg, #6b7280, #4b5563)",
              color: "white",
              borderRadius: "12px",
              fontSize: "9px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "4px",
              boxShadow: isRecording
                ? "0 0 8px rgba(16, 185, 129, 0.4)"
                : "none",
              animation: isRecording ? "pulse 2s infinite" : "none",
            }}
          >
            <div
              style={{
                width: "4px",
                height: "4px",
                background: "white",
                borderRadius: "50%",
                opacity: isRecording ? 1 : 0.6,
              }}
            ></div>
            {isRecording ? "REC" : "PAUSED"}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Filter Dropdown */}
          <div style={{ position: "relative" }}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                padding: "4px 6px",
                background: "rgba(30, 30, 46, 0.8)",
                border: "1px solid rgba(75, 85, 99, 0.5)",
                borderRadius: "6px",
                color: "#e2e8f0",
                fontSize: "10px",
                cursor: "pointer",
                backdropFilter: "blur(4px)",
                minWidth: "90px",
              }}
            >
              <option value="all">All</option>
              <option value="interactions">Interactions</option>
              <option value="renders">Renders</option>
              <option value="network">Network</option>
              <option value="longtasks">Long Tasks</option>
            </select>
          </div>

          {/* Control Buttons */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => setIsRecording(!isRecording)}
              style={{
                padding: "4px 8px",
                background: isRecording
                  ? "linear-gradient(135deg, #dc2626, #b91c1c)"
                  : "linear-gradient(135deg, #10b981, #059669)",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontSize: "10px",
                fontWeight: "500",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                transition: "all 0.2s ease",
              }}
            >
              {isRecording ? "Pause" : "Resume"}
            </button>

            <button
              onClick={clearData}
              style={{
                padding: "4px 8px",
                background: "linear-gradient(135deg, #6b7280, #4b5563)",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontSize: "10px",
                fontWeight: "500",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                transition: "all 0.2s ease",
              }}
            >
              Clear
            </button>

            <button
              onClick={exportData}
              style={{
                padding: "4px 8px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                border: "none",
                borderRadius: "6px",
                color: "white",
                fontSize: "10px",
                fontWeight: "500",
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(59, 130, 246, 0.3)",
                transition: "all 0.2s ease",
              }}
            >
              Export
            </button>
          </div>

          {/* Info & Links */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <a
              href="https://github.com/your-repo/react-performance-monitor"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "4px",
                background: "rgba(30, 30, 46, 0.6)",
                border: "1px solid rgba(75, 85, 99, 0.3)",
                borderRadius: "4px",
                color: "#e2e8f0",
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              title="GitHub"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>

            <button
              onClick={() => setShowInfo(!showInfo)}
              style={{
                padding: "4px",
                background: "rgba(30, 30, 46, 0.6)",
                border: "1px solid rgba(75, 85, 99, 0.3)",
                borderRadius: "4px",
                color: "#e2e8f0",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
              }}
              title="Info"
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 18h-2v-8h2v8zm-1-12.25c.69 0 1.25.56 1.25 1.25s-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25.56-1.25 1.25-1.25z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Info Panel */}
      {showInfo && (
        <div
          style={{
            padding: "12px",
            background: "rgba(30, 30, 46, 0.9)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(75, 85, 99, 0.3)",
            margin: "0 12px",
            borderRadius: "0 0 8px 8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{ display: "flex", alignItems: "flex-start", gap: "16px" }}
          >
            <div
              style={{
                width: "48px",
                height: "48px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
              }}
            >
              <span style={{ fontSize: "24px", color: "white" }}>⚡</span>
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "16px",
                  fontWeight: "700",
                  background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                React Performance Monitor
              </h3>
              <p
                style={{
                  margin: "0 0 12px 0",
                  fontSize: "13px",
                  color: "#cbd5e1",
                  lineHeight: "1.5",
                }}
              >
                Real-time performance profiling for React applications. Track
                interactions, renders, network requests, and long tasks to
                optimize your app's performance.
              </p>
              <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                <a
                  href="https://github.com/your-repo/react-performance-monitor"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#60a5fa",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  GitHub
                </a>
                <a
                  href="https://www.npmjs.com/package/react-performance-monitor"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#60a5fa",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M0 7.334v8h6.666v1.332H12v-1.332h6.666v-8H12V6h-1.334V4H6.666v2H5.334v1.334H0zm6.666 6.666H5.334v-4H3.999v4H1.335V8.667h5.331v5.333zm8.001-5.333h-1.336V10h1.336v4h1.332v-4h1.336v-1.333h-1.336V8.667H12V10h1.334v1.333h1.336v1.333H12v-1.333h1.334V10zm-8.001-2.667H8V6h1.333v1.333h1.333V6H8V4.667zM10.666 6H12V7.333h-1.334V6z" />
                  </svg>
                  npm
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      {currentSession && (
        <div
          style={{
            padding: "8px 12px",
            background: "rgba(30, 30, 46, 0.6)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(75, 85, 99, 0.3)",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
            gap: "8px",
            margin: "0 12px",
            overflowX: "auto",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid rgba(75, 85, 99, 0.3)",
              textAlign: "center",
              minWidth: "70px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: "#9ca3af",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: "500",
              }}
            >
              Time
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                background: "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {currentSession.endTime
                ? `${((currentSession.endTime - currentSession.startTime) / 1000).toFixed(2)}s`
                : "—"}
            </div>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid rgba(75, 85, 99, 0.3)",
              textAlign: "center",
              minWidth: "70px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: "#9ca3af",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: "500",
              }}
            >
              Renders
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#3b82f6",
              }}
            >
              {currentSession.renders.length}
            </div>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid rgba(75, 85, 99, 0.3)",
              textAlign: "center",
              minWidth: "70px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: "#9ca3af",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: "500",
              }}
            >
              Network
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#10b981",
              }}
            >
              {currentSession.network.length}
            </div>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.6)",
              padding: "6px",
              borderRadius: "6px",
              border: "1px solid rgba(75, 85, 99, 0.3)",
              textAlign: "center",
              minWidth: "70px",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: "#9ca3af",
                marginBottom: "4px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                fontWeight: "500",
              }}
            >
              Tasks
            </div>
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#f59e0b",
              }}
            >
              {currentSession.longTasks.length}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "0 12px 12px 12px",
        }}
      >
        {!currentSession ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              textAlign: "center",
              padding: "20px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "12px",
                boxShadow: "0 4px 16px rgba(59, 130, 246, 0.3)",
              }}
            >
              <span style={{ fontSize: "20px", color: "white" }}>📊</span>
            </div>
            <h3
              style={{
                margin: "0 0 8px 0",
                fontSize: "14px",
                fontWeight: "600",
                color: "#e2e8f0",
              }}
            >
              No Data Yet
            </h3>
            <p
              style={{
                margin: 0,
                fontSize: "11px",
                color: "#9ca3af",
                maxWidth: "300px",
                lineHeight: "1.4",
              }}
            >
              Interact with the React app to see performance metrics.
            </p>
          </div>
        ) : (
          <div>
            {/* Event List */}
            <div
              style={{
                background: "rgba(30, 30, 46, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "8px",
                border: "1px solid rgba(75, 85, 99, 0.3)",
                overflow: "hidden",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                marginTop:"10px"
              }}
            >
              <div
                style={{
                  padding: "8px 12px",
                  borderBottom: "1px solid rgba(75, 85, 99, 0.3)",
                  background: "rgba(15, 23, 42, 0.4)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "11px",
                    fontWeight: "500",
                    color: "#e2e8f0",
                  }}
                >
                  Events
                </h3>
                <div
                  style={{
                    fontSize: "9px",
                    color: "#9ca3af",
                    marginTop: "2px",
                  }}
                >
                  {filteredItems.length} • {filter === "all" ? "all" : filter}
                </div>
              </div>

              <div style={{ maxHeight: "400px", overflow: "auto" }}>
                {filteredItems.length === 0 ? (
                  <div
                    style={{
                      padding: "40px 20px",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    No events match the current filter.
                  </div>
                ) : (
                  filteredItems.map((item, index) => (
                    <div
                      key={item.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "6px 8px",
                        borderBottom:
                          index < filteredItems.length - 1
                            ? "1px solid rgba(75, 85, 99, 0.2)"
                            : "none",
                        transition: "background 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(59, 130, 246, 0.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div
                        style={{
                          width: "50px",
                          color: "#9ca3af",
                          fontSize: "9px",
                          fontFamily: "monospace",
                          fontWeight: "500",
                        }}
                      >
                        {item.time > 0
                          ? `${(item.time / 1000).toFixed(2)}s`
                          : "0.00s"}
                      </div>

                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          background: getTypeColor(item.type),
                          marginRight: "6px",
                          flexShrink: 0,
                        }}
                      ></div>

                      <div
                        style={{
                          flex: 1,
                          color: "#e2e8f0",
                          fontWeight: "400",
                          fontSize: "10px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </div>

                      <div
                        style={{
                          width: "45px",
                          textAlign: "right",
                          color: "#60a5fa",
                          fontSize: "9px",
                          fontWeight: "500",
                          fontFamily: "monospace",
                          marginRight: "6px",
                        }}
                      >
                        {item.duration.toFixed(1)}ms
                      </div>

                      <div
                        style={{
                          width: "80px",
                          color: "#9ca3af",
                          fontSize: "9px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.details}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Timeline Visualization */}
            <div
              style={{
                background: "rgba(30, 30, 46, 0.6)",
                backdropFilter: "blur(10px)",
                borderRadius: "8px",
                border: "1px solid rgba(75, 85, 99, 0.3)",
                padding: "12px",
                marginBottom: "12px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              {u({
                items: filteredItems,
                session: currentSession,
                hoveredItem,
                setHoveredItem,
                selectedItem,
                setSelectedItem,
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Timeline visualization component
const u = ({
  items,
  session,
  hoveredItem,
  setHoveredItem,
  selectedItem,
  setSelectedItem,
}) => {
  const maxTime = Math.max(
    ...items.map((item) => item.time + item.duration),
    100,
  );
  const totalDuration = session.endTime
    ? session.endTime - session.startTime
    : maxTime;

  return React.createElement(
    "div",
    { style: { padding: "4px" } },
    React.createElement(
      "h3",
      { style: { margin: "0 0 4px 0", fontSize: "10px", color: "#e2e8f0" } },
      "Timeline",
    ),

    // Timeline header
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          marginBottom: "4px",
          fontSize: "8px",
          color: "#9ca3af",
          borderBottom: "1px solid rgba(75, 85, 99, 0.3)",
          paddingBottom: "1px",
        },
      },
      React.createElement("div", { style: { width: "40px" } }, "Time"),
      React.createElement("div", { style: { flex: 1 } }, "Event"),
      React.createElement(
        "div",
        { style: { width: "35px", textAlign: "right" } },
        "Dur",
      ),
    ),

    // Timeline visualization
    React.createElement(
      "div",
      {
        style: {
          position: "relative",
          height: "80px",
          background: "rgba(30, 30, 46, 0.8)",
          border: "1px solid rgba(75, 85, 99, 0.3)",
          borderRadius: "4px",
          marginBottom: "4px",
          backdropFilter: "blur(4px)",
        },
      },
      // Time scale
      React.createElement(
        "div",
        {
          style: {
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            height: "12px",
            background: "rgba(45, 45, 45, 0.8)",
            borderBottom: "1px solid rgba(75, 85, 99, 0.3)",
            display: "flex",
            alignItems: "center",
            padding: "0 4px",
            fontSize: "8px",
            color: "#9ca3af",
          },
        },
        "0ms",
      ),

      // Timeline bars
      items.map((item, index) =>
        React.createElement("div", {
          key: item.id,
          style: {
            position: "absolute",
            left: `${(item.time / totalDuration) * 100}%`,
            top: `${14 + index * 10}px`,
            width: `${Math.max((item.duration / totalDuration) * 100, 0.5)}%`,
            height: "8px",
            background: getTypeColor(item.type),
            borderRadius: "1px",
            cursor: "pointer",
            opacity: hoveredItem === item.id ? 1 : 0.8,
            transition: "opacity 0.2s ease",
          },
          onMouseEnter: () => setHoveredItem(item.id),
          onMouseLeave: () => setHoveredItem(null),
          onClick: () =>
            setSelectedItem(selectedItem === item.id ? null : item.id),
          title: `${item.label} - ${item.duration.toFixed(1)}ms`,
        }),
      ),
    ),

    // Item details
    selectedItem &&
      React.createElement(
        "div",
        {
          style: {
            padding: "4px",
            background: "rgba(45, 45, 45, 0.8)",
            borderRadius: "4px",
            marginTop: "4px",
            backdropFilter: "blur(4px)",
            border: "1px solid rgba(75, 85, 99, 0.3)",
          },
        },
        React.createElement(
          "h4",
          { style: { margin: "0 0 4px 0", fontSize: "9px", color: "#e2e8f0" } },
          "Details",
        ),
        (() => {
          const item = items.find((i) => i.id === selectedItem);
          return item
            ? React.createElement(
                "div",
                null,
                React.createElement(
                  "div",
                  {
                    style: {
                      color: "#cbd5e1",
                      marginBottom: "2px",
                      fontSize: "8px",
                    },
                  },
                  `Type: ${item.type}`,
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      color: "#cbd5e1",
                      marginBottom: "2px",
                      fontSize: "8px",
                    },
                  },
                  `Label: ${item.label}`,
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      color: "#cbd5e1",
                      marginBottom: "2px",
                      fontSize: "8px",
                    },
                  },
                  `Time: ${(item.time / 1000).toFixed(2)}s`,
                ),
                React.createElement(
                  "div",
                  {
                    style: {
                      color: "#cbd5e1",
                      marginBottom: "2px",
                      fontSize: "8px",
                    },
                  },
                  `Duration: ${item.duration.toFixed(1)}ms`,
                ),
                item.details &&
                  React.createElement(
                    "div",
                    { style: { color: "#9ca3af", fontSize: "8px" } },
                    `Details: ${item.details}`,
                  ),
              )
            : null;
        })(),
      ),
  );
};

function getTypeColor(type) {
  switch (type) {
    case "interaction":
      return "#f59e0b";
    case "render":
      return "#3b82f6";
    case "network":
      return "#10b981";
    case "longtask":
      return "#ef4444";
    default:
      return "#6b7280";
  }
}

// Render the panel
root.render(<Panel />);
