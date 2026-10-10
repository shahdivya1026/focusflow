"use client";

import { useEffect, useState } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Calendar from "./components/Calendar";
import HourglassClock from "./components/HourglassClock";
import AuthGuard from "./components/AuthGuard";

export default function Home() {
  const [showForm, setShowForm] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const [editingTaskId, setEditingTaskId] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Focus timer
  const [focusSeconds, setFocusSeconds] = useState(0);
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusStartTime, setFocusStartTime] = useState(null);

  // Dynamic greeting
  function getGreeting() {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good Morning";
    }

    if (hour >= 12 && hour < 17) {
      return "Good Afternoon";
    }

    if (hour >= 17 && hour < 21) {
      return "Good Evening";
    }

    return "Good Night";
  }

  // Run focus timer
  useEffect(() => {
    if (!focusRunning) {
      return;
    }

    const timer = setInterval(() => {
      setFocusSeconds((currentSeconds) => currentSeconds + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [focusRunning]);

  // Check authentication first, then fetch tasks
  useEffect(() => {
    let cancelled = false;

    async function loadTasks() {
      try {
        setTasksLoading(true);

        // First check whether the user is authenticated
        const authResponse = await fetch("/api/auth/me", {
          cache: "no-store",
        });

        if (!authResponse.ok) {
          return;
        }

        // Only fetch tasks after authentication is confirmed
        const taskResponse = await fetch("/api/tasks", {
          cache: "no-store",
        });

        const data = await taskResponse.json();

        if (!cancelled && taskResponse.ok) {
          setTasks(data);
        }

        if (!taskResponse.ok) {
          console.error(
            data.error || "Failed to fetch tasks."
          );
        }
      } catch (error) {
        if (!cancelled) {
          console.error(
            "Failed to load tasks:",
            error
          );
        }
      } finally {
        if (!cancelled) {
          setTasksLoading(false);
        }
      }
    }

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, []);

  // Start focus session
  function handleStartFocus() {
    setFocusStartTime(new Date());
    setFocusSeconds(0);
    setFocusRunning(true);
  }

  // End focus session and save it
  async function handleEndFocus() {
    if (!focusStartTime) {
      return;
    }

    const endTime = new Date();

    const duration = Math.floor(
      (endTime.getTime() - focusStartTime.getTime()) / 1000
    );

    try {
      const response = await fetch("/api/focus-sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startTime: focusStartTime.toISOString(),
          endTime: endTime.toISOString(),
          duration: duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to save focus session."
        );
        return;
      }

      setFocusRunning(false);
      setFocusStartTime(null);
      setFocusSeconds(0);

      alert("Focus session saved successfully!");
    } catch (error) {
      console.error(
        "Failed to save focus session:",
        error
      );

      alert(
        "Something went wrong while saving your focus session."
      );
    }
  }

  // Add a new task
  async function handleAddTask() {
    if (taskTitle.trim() === "") {
      alert("Please enter a task name.");
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: taskTitle,
          description: taskDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to add task."
        );
        return;
      }

      setTasks((currentTasks) => [
        ...currentTasks,
        data,
      ]);

      setTaskTitle("");
      setTaskDescription("");
      setShowForm(false);
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while adding the task."
      );
    }
  }

  // Change Pending <-> Completed
  async function toggleTask(taskId) {
    const task = tasks.find(
      (item) => item.id === taskId
    );

    if (!task) {
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: taskId,
          title: task.title,
          description: task.description,
          completed: !task.completed,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to update task status."
        );
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((item) =>
          item.id === taskId ? data : item
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while updating the task status."
      );
    }
  }

  // Start editing a task
  function handleEditTask(task) {
    setEditingTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(
      task.description || ""
    );
    setShowForm(true);
  }

  // Save edited task
  async function handleSaveEdit() {
    if (taskTitle.trim() === "") {
      alert("Please enter a task name.");
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: editingTaskId,
          title: taskTitle,
          description: taskDescription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to update task."
        );
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? data
            : task
        )
      );

      setEditingTaskId(null);
      setTaskTitle("");
      setTaskDescription("");
      setShowForm(false);
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while updating the task."
      );
    }
  }

  // Delete a task
  async function handleDeleteTask(taskId) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch("/api/tasks", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: taskId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(
          data.error ||
            "Failed to delete task."
        );
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.filter(
          (task) => task.id !== taskId
        )
      );
    } catch (error) {
      console.error(error);

      alert(
        "Something went wrong while deleting the task."
      );
    }
  }

  // Search and filter tasks
  const filteredTasks = tasks.filter((task) => {
    const title = task.title || "";

    const matchesSearch = title
      .toLowerCase()
      .includes(searchText.toLowerCase());

    let matchesFilter = true;

    if (filterStatus === "pending") {
      matchesFilter = task.completed === false;
    }

    if (filterStatus === "completed") {
      matchesFilter = task.completed === true;
    }

    return (
      matchesSearch &&
      matchesFilter
    );
  });

  // Focus time display
  const focusHours = Math.floor(
    focusSeconds / 3600
  );

  const focusMinutes = Math.floor(
    (focusSeconds % 3600) / 60
  );

  const focusRemainingSeconds =
    focusSeconds % 60;

  const displayFocusTime =
    focusHours +
    "h " +
    String(focusMinutes).padStart(2, "0") +
    "m " +
    String(focusRemainingSeconds).padStart(
      2,
      "0"
    ) +
    "s";

  // Cancel the form
  function handleCancel() {
    setShowForm(false);
    setEditingTaskId(null);
    setTaskTitle("");
    setTaskDescription("");
  }

  return (
    <AuthGuard>
      <main>
        <div className="dashboard-layout">
          <Sidebar />

          <div className="dashboard-content">
            <Header />

            {/* Welcome Card */}
            <div className="welcome-card">
              <div>
                <p className="welcome-label">
                  YOUR PRODUCTIVITY SPACE
                </p>

                <h2>
                  {getGreeting()}! Stay focused,
                  stay productive ✨
                </h2>

                <p className="welcome-description">
                  Organize your tasks, manage your
                  time, and make progress toward your
                  goals.
                </p>
              </div>

              <div className="quick-stats">
                <div className="stat">
                  <span>Tasks</span>

                  <strong>
                    {tasks.length}
                  </strong>
                </div>

                <div className="stat">
                  <span>Completed</span>

                  <strong>
                    {
                      tasks.filter(
                        (task) =>
                          task.completed
                      ).length
                    }
                  </strong>
                </div>

                <div className="stat">
                  <span>Focus Time</span>

                  <strong>
                    {displayFocusTime}
                  </strong>

                  {!focusRunning ? (
                    <button
                      type="button"
                      className="focus-button"
                      onClick={
                        handleStartFocus
                      }
                    >
                      Start Focus
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="focus-button pause"
                      onClick={
                        handleEndFocus
                      }
                    >
                      End Focus
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Calendar and Clock */}
            <div className="calendar-clock-row">
              <Calendar dashboardOnly={true} />

              <HourglassClock />
            </div>

            {/* Tasks Section */}
            <div className="tasks-section">
              <div className="section-header">
                <h2>Today's Tasks</h2>

                <button
                  type="button"
                  onClick={() => {
                    setShowForm(true);
                    setEditingTaskId(null);
                    setTaskTitle("");
                    setTaskDescription("");
                  }}
                >
                  Add Task
                </button>
              </div>

              {/* Add / Edit Task Form */}
              {showForm && (
                <div className="task-form">
                  <input
                    type="text"
                    placeholder="Enter task name"
                    value={taskTitle}
                    onChange={(e) =>
                      setTaskTitle(
                        e.target.value
                      )
                    }
                  />

                  <input
                    type="text"
                    placeholder="Enter task description"
                    value={taskDescription}
                    onChange={(e) =>
                      setTaskDescription(
                        e.target.value
                      )
                    }
                  />

                  {editingTaskId !== null ? (
                    <>
                      <button
                        type="button"
                        onClick={
                          handleSaveEdit
                        }
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleCancel
                        }
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={
                          handleAddTask
                        }
                      >
                        Add
                      </button>

                      <button
                        type="button"
                        onClick={
                          handleCancel
                        }
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Search and Filters */}
              <div className="task-search-filter">
                <div className="task-search">
                  <input
                    type="text"
                    placeholder="🔍 Search tasks by title..."
                    value={searchText}
                    onChange={(e) =>
                      setSearchText(
                        e.target.value
                      )
                    }
                  />
                </div>

                <div className="task-filters">
                  <button
                    type="button"
                    className={
                      filterStatus === "all"
                        ? "filter-button active"
                        : "filter-button"
                    }
                    onClick={() =>
                      setFilterStatus("all")
                    }
                  >
                    All
                  </button>

                  <button
                    type="button"
                    className={
                      filterStatus ===
                      "pending"
                        ? "filter-button active"
                        : "filter-button"
                    }
                    onClick={() =>
                      setFilterStatus(
                        "pending"
                      )
                    }
                  >
                    Pending
                  </button>

                  <button
                    type="button"
                    className={
                      filterStatus ===
                      "completed"
                        ? "filter-button active"
                        : "filter-button"
                    }
                    onClick={() =>
                      setFilterStatus(
                        "completed"
                      )
                    }
                  >
                    Completed
                  </button>
                </div>
              </div>

              {/* Task List */}
              <div className="task-list">
                {tasksLoading ? (
                  <div className="tasks-loading">
                    <div className="tasks-loading-spinner"></div>

                    <p>
                      Loading your tasks...
                    </p>
                  </div>
                ) : filteredTasks.length ===
                  0 ? (
                  <div className="tasks-empty-dashboard">
                    {searchText.trim() !==
                    "" ? (
                      <>
                        <div className="tasks-empty-icon">
                          🔍
                        </div>

                        <h3>
                          No tasks found
                        </h3>

                        <p>
                          Try a different
                          search.
                        </p>
                      </>
                    ) : filterStatus ===
                      "pending" ? (
                      <>
                        <div className="tasks-empty-icon">
                          ✓
                        </div>

                        <h3>
                          No pending tasks
                        </h3>

                        <p>
                          You're all caught
                          up!
                        </p>
                      </>
                    ) : filterStatus ===
                      "completed" ? (
                      <>
                        <div className="tasks-empty-icon">
                          ✨
                        </div>

                        <h3>
                          No completed tasks
                          yet
                        </h3>

                        <p>
                          Complete a task and
                          it will appear here.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="tasks-empty-icon">
                          📝
                        </div>

                        <h3>
                          No tasks available
                        </h3>

                        <p>
                          Add your first task
                          to get started.
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      className="task-card"
                      key={task.id}
                    >
                      <div className="task-info">
                        <h3>
                          {task.title}
                        </h3>

                        {task.description && (
                          <p>
                            {task.description}
                          </p>
                        )}
                      </div>

                      <div className="task-actions">
                        <button
                          type="button"
                          className={
                            task.completed
                              ? "task-status completed"
                              : "task-status"
                          }
                          onClick={() =>
                            toggleTask(
                              task.id
                            )
                          }
                        >
                          {task.completed
                            ? "Completed"
                            : "Pending"}
                        </button>

                        <button
                          type="button"
                          className="edit-button"
                          onClick={() =>
                            handleEditTask(
                              task
                            )
                          }
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          onClick={() =>
                            handleDeleteTask(
                              task.id
                            )
                          }
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthGuard>
  );
}