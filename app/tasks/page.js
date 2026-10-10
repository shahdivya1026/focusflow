"use client";

import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import AuthGuard from "../components/AuthGuard";

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [totalHours, setTotalHours] = useState("");

  const [searchText, setSearchText] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [loading, setLoading] = useState(true);

  // Fetch tasks
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch("/api/tasks");
        const data = await response.json();

        if (response.ok) {
          setTasks(data);
        } else {
          console.error(data.error);
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  // Open Add Task form
  function openAddForm() {
    setEditingTaskId(null);

    setTaskTitle("");
    setTaskDescription("");
    setStartDate("");
    setEndDate("");
    setTotalHours("");

    setShowForm(true);
  }

  // Open Edit Task form
  function handleEditTask(task) {
    setEditingTaskId(task.id);

    setTaskTitle(task.title || "");
    setTaskDescription(task.description || "");

    setStartDate(
      task.startDate
        ? new Date(task.startDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setEndDate(
      task.endDate
        ? new Date(task.endDate)
            .toISOString()
            .split("T")[0]
        : ""
    );

    setTotalHours(
      task.totalHours !== null &&
      task.totalHours !== undefined
        ? task.totalHours
        : ""
    );

    setShowForm(true);
  }

  // Add Task
  async function handleAddTask() {
    if (!taskTitle.trim()) {
      alert("Please enter a task name.");
      return;
    }

    if (!startDate) {
      alert("Please select a start date.");
      return;
    }

    if (!endDate) {
      alert("Please select an end date.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End date cannot be before start date.");
      return;
    }

    if (
      totalHours === "" ||
      Number(totalHours) <= 0
    ) {
      alert("Please enter valid total hours.");
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
          startDate,
          endDate,
          totalHours: Number(totalHours),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to add task.");
        return;
      }

      setTasks((currentTasks) => [
        data,
        ...currentTasks,
      ]);

      handleCancel();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while adding the task.");
    }
  }

  // Save edited task
  async function handleSaveEdit() {
    if (!taskTitle.trim()) {
      alert("Please enter a task name.");
      return;
    }

    if (!startDate) {
      alert("Please select a start date.");
      return;
    }

    if (!endDate) {
      alert("Please select an end date.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert("End date cannot be before start date.");
      return;
    }

    if (
      totalHours === "" ||
      Number(totalHours) <= 0
    ) {
      alert("Please enter valid total hours.");
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
          startDate,
          endDate,
          totalHours: Number(totalHours),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Failed to update task.");
        return;
      }

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTaskId
            ? data
            : task
        )
      );

      handleCancel();
    } catch (error) {
      console.error(error);
      alert("Something went wrong while updating the task.");
    }
  }

  // Change task status
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
          id: task.id,
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
          item.id === taskId
            ? data
            : item
        )
      );
    } catch (error) {
      console.error(error);
      alert(
        "Something went wrong while updating the task."
      );
    }
  }

  // Delete task
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

  // Cancel form
  function handleCancel() {
    setShowForm(false);
    setEditingTaskId(null);

    setTaskTitle("");
    setTaskDescription("");
    setStartDate("");
    setEndDate("");
    setTotalHours("");
  }

  // Search and filter
  const filteredTasks = tasks.filter((task) => {
    const search =
      searchText.toLowerCase().trim();

    const matchesSearch =
      task.title
        ?.toLowerCase()
        .includes(search);

    let matchesFilter = true;

    if (filterStatus === "pending") {
      matchesFilter = !task.completed;
    }

    if (filterStatus === "completed") {
      matchesFilter = task.completed;
    }

    return matchesSearch && matchesFilter;
  });

  // Format date
  function formatDate(dateString) {
    if (!dateString) {
      return "—";
    }

    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  }

  return (
    <AuthGuard>
      <main>
        <div className="dashboard-layout">

          <Sidebar />

          <div className="dashboard-content">

            <Header />

            <div className="tasks-page">

              {/* Page Header */}
              <div className="tasks-page-header">

                <div>
                  <p className="tasks-page-label">
                    PRODUCTIVITY
                  </p>

                  <h1>My Tasks</h1>

                  <p>
                    Plan your work, track your
                    progress, and stay organized.
                  </p>
                </div>

                <button
                  type="button"
                  className="add-task-main-button"
                  onClick={openAddForm}
                >
                  + Add New Task
                </button>

              </div>

              {/* Add / Edit Form */}
              {showForm && (
                <div className="task-modal-overlay">

                  <div className="task-modal">

                    <div className="task-modal-header">

                      <div>
                        <p className="task-modal-label">
                          TASK MANAGEMENT
                        </p>

                        <h2>
                          {editingTaskId !== null
                            ? "Edit Task"
                            : "Add New Task"}
                        </h2>
                      </div>

                      <button
                        type="button"
                        className="task-modal-close"
                        onClick={handleCancel}
                      >
                        ×
                      </button>

                    </div>

                    <div className="task-form-grid">

                      <div className="task-form-field full">
                        <label>
                          Task Name
                        </label>

                        <input
                          type="text"
                          placeholder="Enter task name"
                          value={taskTitle}
                          onChange={(event) =>
                            setTaskTitle(
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="task-form-field full">
                        <label>
                          Description
                        </label>

                        <textarea
                          placeholder="Enter task description"
                          value={taskDescription}
                          onChange={(event) =>
                            setTaskDescription(
                              event.target.value
                            )
                          }
                          rows="3"
                        />
                      </div>

                      <div className="task-form-field">
                        <label>
                          Start Date
                        </label>

                        <input
                          type="date"
                          value={startDate}
                          onChange={(event) =>
                            setStartDate(
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="task-form-field">
                        <label>
                          End Date
                        </label>

                        <input
                          type="date"
                          value={endDate}
                          onChange={(event) =>
                            setEndDate(
                              event.target.value
                            )
                          }
                        />
                      </div>

                      <div className="task-form-field">
                        <label>
                          Total Hours
                        </label>

                        <input
                          type="number"
                          min="0.5"
                          step="0.5"
                          placeholder="e.g. 6"
                          value={totalHours}
                          onChange={(event) =>
                            setTotalHours(
                              event.target.value
                            )
                          }
                        />
                      </div>

                    </div>

                    <div className="task-modal-actions">

                      <button
                        type="button"
                        className="task-cancel-button"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="task-save-button"
                        onClick={
                          editingTaskId !== null
                            ? handleSaveEdit
                            : handleAddTask
                        }
                      >
                        {editingTaskId !== null
                          ? "Save Changes"
                          : "Add Task"}
                      </button>

                    </div>

                  </div>

                </div>
              )}

              {/* Search + Filters */}
              <div className="tasks-toolbar">

                <div className="tasks-search-box">

                  <span>⌕</span>

                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchText}
                    onChange={(event) =>
                      setSearchText(
                        event.target.value
                      )
                    }
                  />

                </div>

                <div className="tasks-filter-buttons">

                  <button
                    type="button"
                    className={
                      filterStatus === "all"
                        ? "task-filter active"
                        : "task-filter"
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
                      filterStatus === "pending"
                        ? "task-filter active"
                        : "task-filter"
                    }
                    onClick={() =>
                      setFilterStatus("pending")
                    }
                  >
                    Pending
                  </button>

                  <button
                    type="button"
                    className={
                      filterStatus === "completed"
                        ? "task-filter active"
                        : "task-filter"
                    }
                    onClick={() =>
                      setFilterStatus("completed")
                    }
                  >
                    Completed
                  </button>

                </div>

              </div>

              {/* Task Table */}
              <div className="tasks-table-card">

                <div className="tasks-table-header">

                  <div>
                    <h2>Task List</h2>

                    <p>
                      {filteredTasks.length}{" "}
                      {filteredTasks.length === 1
                        ? "task"
                        : "tasks"}{" "}
                      found
                    </p>
                  </div>

                </div>

                {loading ? (
                  <div className="tasks-empty">
                    Loading tasks...
                  </div>
                ) : filteredTasks.length === 0 ? (
                  <div className="tasks-empty">

                    <div className="empty-task-icon">
                      ✓
                    </div>

                    <h3>No tasks found</h3>

                    <p>
                      {searchText
                        ? "Try a different search."
                        : "Add your first task to get started."}
                    </p>

                  </div>
                ) : (
                  <div className="tasks-table-wrapper">

                    <table className="tasks-table">

                      <thead>
                        <tr>
                          <th>Task</th>
                          <th>Start Date</th>
                          <th>End Date</th>
                          <th>Total Hours</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>

                        {filteredTasks.map(
                          (task) => (
                            <tr key={task.id}>

                              <td>
                                <div className="task-name-cell">

                                  <div
                                    className={
                                      task.completed
                                        ? "task-check completed"
                                        : "task-check"
                                    }
                                    onClick={() =>
                                      toggleTask(
                                        task.id
                                      )
                                    }
                                  >
                                    {task.completed
                                      ? "✓"
                                      : ""}
                                  </div>

                                  <div>
                                    <strong
                                      className={
                                        task.completed
                                          ? "completed-task-title"
                                          : ""
                                      }
                                    >
                                      {task.title}
                                    </strong>

                                    {task.description && (
                                      <span>
                                        {
                                          task.description
                                        }
                                      </span>
                                    )}
                                  </div>

                                </div>
                              </td>

                              <td>
                                {formatDate(
                                  task.startDate
                                )}
                              </td>

                              <td>
                                {formatDate(
                                  task.endDate
                                )}
                              </td>

                              <td>
                                <span className="hours-badge">
                                  {task.totalHours}
                                  {" "}hrs
                                </span>
                              </td>

                              <td>
                                <button
                                  type="button"
                                  className={
                                    task.completed
                                      ? "status-badge completed"
                                      : "status-badge pending"
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
                              </td>

                              <td>
                                <div className="table-actions">

                                  <button
                                    type="button"
                                    className="table-edit-button"
                                    title="Edit task"
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
                                    className="table-delete-button"
                                    title="Delete task"
                                    onClick={() =>
                                      handleDeleteTask(
                                        task.id
                                      )
                                    }
                                  >
                                    🗑️
                                  </button>

                                </div>
                              </td>

                            </tr>
                          )
                        )}

                      </tbody>

                    </table>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>
      </main>
    </AuthGuard>
  );
}