// Timeline visualization component
const TimelineVisualization = ({ items, session }) => {
  const [hoveredItem, setHoveredItem] = React.useState(null)
  const [selectedItem, setSelectedItem] = React.useState(null)

  const maxTime = Math.max(...items.map(item => item.time + item.duration), 100)
  const totalDuration = session.endTime ? (session.endTime - session.startTime) : maxTime

  console.log("RPM Timeline Debug:", {
    sessionStartTime: session.startTime,
    sessionEndTime: session.endTime,
    totalDuration,
    items: items.map(item => ({
      id: item.id,
      type: item.type,
      time: item.time,
      duration: item.duration,
      timeInSeconds: item.time / 1000
    }))
  })

  return React.createElement('div', { style: { padding: '16px' } },
    React.createElement('h3', { style: { margin: '0 0 16px 0', fontSize: '14px' } }, 'Performance Timeline'),

    // Timeline header
    React.createElement('div', {
      style: {
        display: 'flex',
        marginBottom: '8px',
        fontSize: '11px',
        color: '#9ca3af',
        borderBottom: '1px solid #374151',
        paddingBottom: '4px'
      }
    },
      React.createElement('div', { style: { width: '80px' } }, 'Time'),
      React.createElement('div', { style: { flex: 1 } }, 'Event'),
      React.createElement('div', { style: { width: '60px', textAlign: 'right' } }, 'Duration')
    ),

    // Timeline visualization
    React.createElement('div', {
      style: {
        position: 'relative',
        height: '200px',
        background: '#1e1e1e',
        border: '1px solid #374151',
        borderRadius: '4px',
        marginBottom: '16px'
      }
    },
      // Time scale
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: '0',
          left: '0',
          right: '0',
          height: '20px',
          background: '#2d2d2d',
          borderBottom: '1px solid #374151',
          display: 'flex',
          alignItems: 'center',
          padding: '0 8px',
          fontSize: '10px',
          color: '#9ca3af'
        }
      }, '0ms'),

      // Timeline bars
      items.map((item, index) =>
        React.createElement('div', {
          key: item.id,
          style: {
            position: 'absolute',
            left: `${(item.time / totalDuration) * 100}%`,
            top: `${30 + (index * 25)}px`,
            width: `${Math.max((item.duration / totalDuration) * 100, 0.5)}%`,
            height: '16px',
            background: getTypeColor(item.type),
            borderRadius: '2px',
            cursor: 'pointer',
            opacity: hoveredItem === item.id ? 1 : 0.8
          },
          onMouseEnter: () => setHoveredItem(item.id),
          onMouseLeave: () => setHoveredItem(null),
          onClick: () => setSelectedItem(selectedItem === item.id ? null : item.id),
          title: `${item.label} - ${item.duration.toFixed(1)}ms`
        })
      )
    ),

    // Item details
    selectedItem && React.createElement('div', {
      style: {
        padding: '12px',
        background: '#2d2d2d',
        borderRadius: '4px',
        marginTop: '8px'
      }
    },
      React.createElement('h4', { style: { margin: '0 0 8px 0', fontSize: '13px' } }, 'Details'),
      (() => {
        const item = items.find(i => i.id === selectedItem)
        return item ? React.createElement('div', null,
          React.createElement('div', null, `Type: ${item.type}`),
          React.createElement('div', null, `Label: ${item.label}`),
          React.createElement('div', null, `Time: ${(item.time / 1000).toFixed(3)}s`),
          React.createElement('div', null, `Duration: ${item.duration.toFixed(1)}ms`),
          item.details && React.createElement('div', null, `Details: ${item.details}`)
        ) : null
      })()
    )
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

// Export for use in panel
window.RPMTimeline = TimelineVisualization