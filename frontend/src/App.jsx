import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

function parseErrorMessage(payload, fallbackMessage) {
  if (payload && typeof payload.message === 'string') {
    return payload.message
  }

  return fallbackMessage
}

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [actionError, setActionError] = useState('')
  const [pendingTaskIds, setPendingTaskIds] = useState([])

  const setTaskPending = (taskId, isPending) => {
    setPendingTaskIds((current) => {
      if (isPending) {
        if (current.includes(taskId)) {
          return current
        }

        return [...current, taskId]
      }

      return current.filter((id) => id !== taskId)
    })
  }

  const isTaskPending = (taskId) => pendingTaskIds.includes(taskId)

  const loadTasks = async () => {
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`)
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, 'Unable to fetch tasks.'))
      }

      setTasks(payload.data ?? [])
    } catch (loadError) {
      setError(loadError.message || 'Unable to fetch tasks.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTasks()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (title.trim().length === 0) {
      setActionError('Task title cannot be empty.')
      return
    }

    setActionError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, 'Unable to create task.'))
      }

      setTasks((current) => [payload.data, ...current])
      setTitle('')
    } catch (submitError) {
      setActionError(submitError.message || 'Unable to create task.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleCompleted = async (task) => {
    setActionError('')
    setTaskPending(task.id, true)

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, 'Unable to update task.'))
      }

      setTasks((current) =>
        current.map((currentTask) =>
          currentTask.id === task.id ? payload.data : currentTask,
        ),
      )
    } catch (toggleError) {
      setActionError(toggleError.message || 'Unable to update task.')
    } finally {
      setTaskPending(task.id, false)
    }
  }

  const handleDelete = async (taskId) => {
    setActionError('')
    setTaskPending(taskId, true)

    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
      })

      let payload = null
      try {
        payload = await response.json()
      } catch (_error) {
        payload = null
      }

      if (!response.ok) {
        throw new Error(parseErrorMessage(payload, 'Unable to delete task.'))
      }

      setTasks((current) => current.filter((task) => task.id !== taskId))
    } catch (deleteError) {
      setActionError(deleteError.message || 'Unable to delete task.')
    } finally {
      setTaskPending(taskId, false)
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <h1>Task Manager</h1>
        <p>Create, complete, and remove tasks.</p>
      </header>

      <form className="task-form" onSubmit={handleSubmit}>
        <label htmlFor="task-title">Task title</label>
        <div className="task-form-row">
          <input
            id="task-title"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="e.g. Prepare assignment summary"
            disabled={isSubmitting}
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
        </div>
      </form>

      {error && (
        <div className="feedback error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={loadTasks}>
            Retry
          </button>
        </div>
      )}

      {actionError && (
        <div className="feedback error" role="alert">
          {actionError}
        </div>
      )}

      {isLoading ? (
        <p className="status">Loading tasks...</p>
      ) : tasks.length === 0 ? (
        <p className="status">No tasks yet. Add your first task above.</p>
      ) : (
        <ul className="task-list">
          {tasks.map((task) => (
            <li key={task.id} className="task-item">
              <label>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleCompleted(task)}
                  disabled={isTaskPending(task.id)}
                />
                <span className={task.completed ? 'done' : ''}>{task.title}</span>
              </label>

              <button
                type="button"
                className="danger"
                onClick={() => handleDelete(task.id)}
                disabled={isTaskPending(task.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default App
