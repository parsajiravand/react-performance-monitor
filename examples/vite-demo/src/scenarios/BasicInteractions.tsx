import { useMemo, useState } from "react"
import type { ScenarioComponentProps } from "./types"

interface User {
  id: number
  name: string
  email: string
}

const USERS_ENDPOINT = "https://jsonplaceholder.typicode.com/users"

const BasicInteractions = (_props: ScenarioComponentProps) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState("")

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(USERS_ENDPOINT)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`)
      }
      const data = (await response.json()) as User[]
      setUsers(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = useMemo(() => {
    const start = performance.now()
    const lowercase = filter.toLowerCase()
    while (performance.now() - start < 8) {
      Math.sqrt(Math.random() * Number.MAX_SAFE_INTEGER)
    }
    return users.filter(user => user.name.toLowerCase().includes(lowercase))
  }, [users, filter])

  return (
    <div className="scenario-panel">
      <header>
        <h2>Basic Interactions</h2>
        <p>
          Demonstrates how user input, component renders, and simple fetch calls are grouped into
          interaction sessions. IDs are resolved automatically from button text, <code>id</code>, or{" "}
          <code>placeholder</code>—no <code>data-rpm-id</code> needed. Try the actions below and
          inspect the HUD timeline.
        </p>
      </header>

      <section className="control-strip">
        <button type="button" disabled={loading} onClick={loadUsers}>
          {loading ? "Loading…" : "Load users"}
        </button>
        <label htmlFor="basic-filter">
          Filter users
          <input
            id="basic-filter"
            placeholder="Start typing a name"
            value={filter}
            onChange={event => setFilter(event.target.value)}
            disabled={!users.length}
          />
        </label>
        <button
          type="button"
          aria-label="Clear filter"
          disabled={!filter}
          onClick={() => setFilter("")}
        >
          ×
        </button>
        <button
          type="button"
          disabled={!users.length}
          onClick={() => setUsers(prev => [...prev].reverse())}
        >
          Refresh order
        </button>
      </section>

      {error ? <div className="notice notice--error">Failed to load users: {error}</div> : null}

      <section className="list-panel">
        {users.length === 0 ? (
          <p className="empty-state">Load the sample data to begin exploring.</p>
        ) : (
          <ul className="user-list">
            {filteredUsers.map(user => (
              <li key={user.id}>
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default BasicInteractions
