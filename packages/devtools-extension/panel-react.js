// React-based DevTools panel
import React, { useState, useEffect, useMemo } from 'react'
import { createRoot } from 'react-dom/client'

// DevTools panel root
const container = document.getElementById('root')
const root = createRoot(container)

// Panel state
const Panel = () => {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [filter, setFilter] = useState('all') // all, interactions, renders, network, longtasks
  const [isRecording, setIsRecording] = useState(true)
  const [maxItems, setMaxItems] = useState(50)

  // Connect to background service worker
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "rpm-devtools" })

    port.onMessage.addListener((message) => {
      if (message.type === "RPM_SESSION" && message.payload) {
        setCurrentSession(message.payload)
        setSessions(prev => [message.payload, ...prev.slice(0, maxItems - 1)])
      } else if (message.type === "RPM_SESSION_UPDATE" && message.payload) {
        // Update current session with new render/network/long task data
        setCurrentSession(message.payload)
        // Also update the session in the sessions array
        setSessions(prev => prev.map(session =>
          session.id === message.payload.id ? message.payload : session
        ))
      } else if (message.type === "RPM_RENDER" && message.payload) {
        // Handle render events
        console.log("Render:", message.payload)
        setCurrentSession(current => {
          if (!current) return current
          const updated = {
            ...current,
            renders: [...current.renders, message.payload],
            endTime: Math.max(current.endTime, message.payload.commitTime)
          }
          // Update in sessions array too
          setSessions(prev => prev.map(session =>
            session.id === current.id ? updated : session
          ))
          return updated
        })
      } else if (message.type === "RPM_NETWORK" && message.payload) {
        // Handle network events
        console.log("Network:", message.payload)
        setCurrentSession(current => {
          if (!current) return current
          const updated = {
            ...current,
            network: [...current.network, message.payload],
            endTime: Math.max(current.endTime, message.payload.endTime)
          }
          // Update in sessions array too
          setSessions(prev => prev.map(session =>
            session.id === current.id ? updated : session
          ))
          return updated
        })
      } else if (message.type === "RPM_LONG_TASK" && message.payload) {
        // Handle long task events
        console.log("Long task:", message.payload)
        setCurrentSession(current => {
          if (!current) return current
          const updated = {
            ...current,
            longTasks: [...current.longTasks, message.payload],
            endTime: Math.max(current.endTime, message.payload.startTime + message.payload.duration)
          }
          // Update in sessions array too
          setSessions(prev => prev.map(session =>
            session.id === current.id ? updated : session
          ))
          return updated
        })
      }
    })

    port.postMessage({ type: "RPM_PANEL_READY" })

    return () => port.disconnect()
  }, [maxItems])

  const filteredItems = useMemo(() => {
    if (!currentSession) return []

    const items = []
    const baseTime = currentSession.startTime

    // Add interaction
    if (currentSession.interaction && (filter === 'all' || filter === 'interactions')) {
      items.push({
        id: `interaction-${currentSession.interaction.startTime}`,
        type: 'interaction',
        label: currentSession.interaction.id,
        time: 0,
        duration: currentSession.endTime ? (currentSession.endTime - baseTime) : 0,
        details: currentSession.interaction.type
      })
    }

    // Add renders
    if (filter === 'all' || filter === 'renders') {
      currentSession.renders.forEach((render, index) => {
        items.push({
          id: `render-${index}`,
          type: 'render',
          label: render.component,
          time: render.startTime - baseTime,
          duration: render.actualDuration,
          details: `phase: ${render.phase}`
        })
      })
    }

    // Add network calls
    if (filter === 'all' || filter === 'network') {
      currentSession.network.forEach((entry, index) => {
        items.push({
          id: `network-${index}`,
          type: 'network',
          label: entry.url,
          time: entry.startTime - baseTime,
          duration: entry.duration,
          details: `${entry.method} • ${entry.status}`
        })
      })
    }

    // Add long tasks
    if (filter === 'all' || filter === 'longtasks') {
      currentSession.longTasks.forEach((entry, index) => {
        items.push({
          id: `longtask-${index}`,
          type: 'longtask',
          label: entry.name || 'Long Task',
          time: entry.startTime - baseTime,
          duration: entry.duration,
          details: `${entry.duration.toFixed(1)}ms`
        })
      })
    }

    return items.sort((a, b) => a.time - b.time)
  }, [currentSession, filter])

  const clearData = () => {
    setSessions([])
    setCurrentSession(null)
  }

  const exportData = () => {
    const data = {
      sessions,
      currentSession,
      timestamp: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rpm-performance-data-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: '#2d2d2d',
        borderBottom: '1px solid #3e3e3e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            React Performance Monitor
          </h1>
          <div style={{
            padding: '2px 8px',
            background: isRecording ? '#4ade80' : '#6b7280',
            color: '#1f2937',
            borderRadius: '12px',
            fontSize: '11px',
            fontWeight: '500'
          }}>
            {isRecording ? '● RECORDING' : '⏸ PAUSED'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              padding: '4px 8px',
              background: '#1e1e1e',
              border: '1px solid #4b5563',
              borderRadius: '4px',
              color: '#f0f0f0',
              fontSize: '12px'
            }}
          >
            <option value="all">All Events</option>
            <option value="interactions">Interactions</option>
            <option value="renders">Renders</option>
            <option value="network">Network</option>
            <option value="longtasks">Long Tasks</option>
          </select>

          <button
            onClick={() => setIsRecording(!isRecording)}
            style={{
              padding: '6px 10px',
              background: isRecording ? '#dc2626' : '#4ade80',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            {isRecording ? 'Pause' : 'Resume'}
          </button>

          <button
            onClick={clearData}
            style={{
              padding: '6px 10px',
              background: '#dc2626',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Clear
          </button>

          <button
            onClick={exportData}
            style={{
              padding: '6px 10px',
              background: '#2563eb',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              fontSize: '11px',
              cursor: 'pointer'
            }}
          >
            Export
          </button>
        </div>
      </div>

      {/* Summary */}
      {currentSession && (
        <div style={{
          padding: '12px 16px',
          background: '#1e1e1e',
          borderBottom: '1px solid #374151',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Total Time</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              {currentSession.endTime
                ? `${((currentSession.endTime - currentSession.startTime) / 1000).toFixed(2)}s`
                : '—'
              }
            </div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Renders</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{currentSession.renders.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Network</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{currentSession.network.length}</div>
          </div>
          <div>
            <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '4px' }}>Long Tasks</div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>{currentSession.longTasks.length}</div>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        padding: '8px 16px'
      }}>
        {!currentSession ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            No performance data yet. Interact with the React app to see metrics.
          </div>
        ) : (
          <div>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '6px 10px',
                  marginBottom: '2px',
                  background: '#2d2d2d',
                  borderRadius: '4px',
                  borderLeft: `3px solid ${getTypeColor(item.type)}`
                }}
              >
                <div style={{ minWidth: '60px', fontSize: '11px', color: '#9ca3af' }}>
                  {item.time > 0 ? `${(item.time / 1000).toFixed(2)}s` : '0.00s'}
                </div>
                <div style={{ flex: 1, marginLeft: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '500', marginBottom: '2px' }}>
                    {item.label}
                  </div>
                  {item.details && (
                    <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                      {item.details}
                    </div>
                  )}
                </div>
                {item.duration > 0 && (
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>
                    {item.duration.toFixed(1)}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function getTypeColor(type) {
  switch (type) {
    case 'interaction': return '#f59e0b'
    case 'render': return '#3b82f6'
    case 'network': return '#10b981'
    case 'longtask': return '#ef4444'
    default: return '#6b7280'
  }
}

// Render the panel
root.render(<Panel />)