import { useEffect, useState } from "react";
import "./App.css";

type Task = {
  id: string;
  title: string;
  completed: boolean;
};

const STORAGE_KEY = "task-manager:tasks";

function loadTasks(): Task[] {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const data = JSON.parse(raw) as Task[];
    if (!Array.isArray(data)) return [];
    return data.map((t) => ({
      id: String(t.id),
      title: String(t.title),
      completed: !!t.completed,
    }));
  } catch {
    return [];
  }
}

function generateId(): string {
  if ("randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasks());
  const [newTitle, setNewTitle] = useState("");

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = newTitle.trim();
    if (!title) return;
    const newTask: Task = { id: generateId(), title, completed: false };
    setTasks((prev) => [newTask, ...prev]);
    setNewTitle("");
  };

  const toggleTask = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  return (
    <div className="app">
      <h1>Task Manager</h1>

      <form className="add-form" onSubmit={handleAdd}>
        <input
          type="text"
          placeholder="Type a task and press Enter"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          aria-label="Task title"
        />
        <button type="submit">Add</button>
      </form>

      <div className="summary">
        Total: {tasks.length} • Completed: {tasks.filter((t) => t.completed).length}
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className="task">
            <label className="task-item">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                aria-label={`Mark "${task.title}" as ${
                  task.completed ? "incomplete" : "complete"
                }`}
              />
              <span className={`title ${task.completed ? "completed" : ""}`}>
                {task.title}
              </span>
            </label>
          </li>
        ))}
        {tasks.length === 0 && <li className="empty">No tasks yet. Add one above.</li>}
      </ul>
    </div>
  );
}
