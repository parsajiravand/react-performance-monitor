import { useEffect, useMemo, useState } from "react"
import axios from "axios"
import { DevHUD, useAttachAxios } from "react-performance-monitor"
import "./app.css"

const axiosInstance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
  timeout: 4000
})

interface User {
  id: number
  name: string
  email: string
}

const PerformanceAdapters = () => {
  const attachAxios = useAttachAxios()

  useEffect(() => {
    const detach = attachAxios(axiosInstance)
    return () => detach()
  }, [attachAxios])

  return null
}

const SlowUserList = ({ users, filter }: { users: User[]; filter: string }) => {
  const filtered = useMemo(() => {
    const lower = filter.toLowerCase()
    const start = performance.now()
    // Artificial CPU work to simulate long renders
    while (performance.now() - start < 10) {
      Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER)
    }
    return users.filter(user => user.name.toLowerCase().includes(lower))
  }, [users, filter])

  if (!users.length) {
    return <p>No users loaded yet.</p>
  }

  return (
    <ul className="user-list">
      {filtered.map(user => (
        <li key={user.id}>
          <strong>{user.name}</strong>
          <span>{user.email}</span>
        </li>
      ))}
    </ul>
  )
}

const DemoDashboard = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState("")
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axiosInstance.get<User[]>("/users")
      setUsers(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="dashboard" data-rpm-group="demo-dashboard">
      <header>
        <h1>React Performance Monitor Demo</h1>
        <p>
          Trigger interactions to see grouped renders, network calls, FPS, and long tasks in the HUD.
        </p>
      </header>

      <div className="controls">
        <button
          type="button"
          data-rpm-id="load-users"
          disabled={loading}
          onClick={loadUsers}
        >
          {loading ? "Loading…" : "Load users"}
        </button>

        <label htmlFor="user-filter">
          Filter
          <input
            id="user-filter"
            data-rpm-id="filter-users"
            placeholder="Search by name"
            value={filter}
            onChange={event => setFilter(event.target.value)}
          />
        </label>
      </div>

      {error ? <div className="error">Failed to load users: {error}</div> : null}

      <SlowUserList users={users} filter={filter} />
    </div>
  )
}

const App = () => {
  return (
    <DevHUD position="top-right" theme="dark" trackNetwork trackFPS trackLongTasks>
      <PerformanceAdapters />
      <DemoDashboard />
    </DevHUD>
  )
}

export default App
