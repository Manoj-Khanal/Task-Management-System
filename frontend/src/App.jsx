import { useEffect, useMemo, useState } from "react";
import "./App.css";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

const API_URL = "https://task-management-system-1gvk.onrender.com";

function App() {
    // =====================================================
    // AUTHENTICATION
    // =====================================================

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [user, setUser] = useState(() => {
        try {
            const savedUser = localStorage.getItem("user");
            return savedUser ? JSON.parse(savedUser) : null;
        } catch {
            return null;
        }
    });

    const [showRegister, setShowRegister] = useState(false);

    // =====================================================
    // NAVIGATION
    // =====================================================

    const [activePage, setActivePage] = useState("dashboard");

    // =====================================================
    // TASKS
    // =====================================================

    const [tasks, setTasks] = useState([]);

    // =====================================================
    // SEARCH & FILTERS
    // =====================================================

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");

    // =====================================================
    // TASK FORM
    // =====================================================

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("todo");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");

    // =====================================================
    // EDIT
    // =====================================================

    const [editingTask, setEditingTask] = useState(null);

    // =====================================================
    // MODAL
    // =====================================================

    const [showTaskModal, setShowTaskModal] = useState(false);

    // =====================================================
    // LOADING
    // =====================================================

    const [loading, setLoading] = useState(false);

    // =====================================================
    // STATISTICS
    // =====================================================

    const totalTasks = tasks.length;

    const todoTasks = tasks.filter(
        (task) => task.status === "todo"
    ).length;

    const inProgressTasks = tasks.filter(
        (task) => task.status === "in-progress"
    ).length;

    const completedTasks = tasks.filter(
        (task) => task.status === "completed"
    ).length;

    const highPriorityTasks = tasks.filter(
        (task) => task.priority === "high"
    ).length;

    const completionPercentage =
        totalTasks === 0
            ? 0
            : Math.round((completedTasks / totalTasks) * 100);

    // =====================================================
    // FILTER TASKS
    // =====================================================

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchesSearch = task.title
                ?.toLowerCase()
                .includes(search.toLowerCase());

            const matchesStatus =
                filterStatus === "all" ||
                task.status === filterStatus;

            const matchesPriority =
                filterPriority === "all" ||
                task.priority === filterPriority;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesPriority
            );
        });
    }, [
        tasks,
        search,
        filterStatus,
        filterPriority
    ]);

    // =====================================================
    // IMPORTANT TASKS
    // =====================================================

    const importantTasks = tasks.filter(
        (task) => task.priority === "high"
    );

    // =====================================================
    // RESET FORM
    // =====================================================

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setStatus("todo");
        setPriority("medium");
        setDueDate("");
        setEditingTask(null);
    };

    // =====================================================
    // OPEN ADD MODAL
    // =====================================================

    const openAddModal = () => {
        resetForm();
        setShowTaskModal(true);
    };

    // =====================================================
    // CLOSE MODAL
    // =====================================================

    const closeTaskModal = () => {
        setShowTaskModal(false);
        resetForm();
    };

    // =====================================================
    // FETCH TASKS
    // =====================================================

    const fetchTasks = async () => {
        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            setIsLoggedIn(false);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/tasks`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                setTasks(data.tasks || []);
            } else {
                if (response.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");

                    setUser(null);
                    setTasks([]);
                    setIsLoggedIn(false);
                }

                alert(
                    data.message ||
                    "Unable to fetch tasks"
                );
            }
        } catch (error) {
            console.error(
                "Fetch tasks error:",
                error
            );

            alert(
                "Unable to connect to server. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // ADD / UPDATE TASK
    // =====================================================

    const handleTaskSubmit = async (e) => {
        e.preventDefault();

        const currentToken =
            localStorage.getItem("token");

        if (!currentToken) {
            setIsLoggedIn(false);
            return;
        }

        if (!title.trim()) {
            alert("Please enter a task title.");
            return;
        }

        try {
            setLoading(true);

            // =================================================
            // UPDATE
            // =================================================

            if (editingTask) {
                const response = await fetch(
                    `${API_URL}/api/tasks/${editingTask._id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${currentToken}`
                        },

                        body: JSON.stringify({
                            title: title.trim(),
                            description:
                                description.trim(),
                            status,
                            priority,
                            dueDate
                        })
                    }
                );

                const data = await response.json();

                if (response.ok) {
                    await fetchTasks();

                    closeTaskModal();
                } else {
                    alert(
                        data.message ||
                        "Unable to update task"
                    );
                }

                return;
            }

            // =================================================
            // CREATE
            // =================================================

            const response = await fetch(
                `${API_URL}/api/tasks`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        Authorization:
                            `Bearer ${currentToken}`
                    },

                    body: JSON.stringify({
                        title: title.trim(),
                        description:
                            description.trim(),
                        status,
                        priority,
                        dueDate
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {
                await fetchTasks();

                closeTaskModal();
            } else {
                alert(
                    data.message ||
                    "Unable to create task"
                );
            }
        } catch (error) {
            console.error(
                "Task request error:",
                error
            );

            alert(
                "Unable to connect to server."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // DELETE TASK
    // =====================================================

    const handleDeleteTask = async (id) => {
        const confirmDelete = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) {
            return;
        }

        const currentToken =
            localStorage.getItem("token");

        if (!currentToken) {
            setIsLoggedIn(false);
            return;
        }

        try {
            setLoading(true);

            const response = await fetch(
                `${API_URL}/api/tasks/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization:
                            `Bearer ${currentToken}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {
                await fetchTasks();
            } else {
                alert(
                    data.message ||
                    "Unable to delete task"
                );
            }
        } catch (error) {
            console.error(
                "Delete task error:",
                error
            );

            alert(
                "Unable to connect to server."
            );
        } finally {
            setLoading(false);
        }
    };

    // =====================================================
    // EDIT TASK
    // =====================================================

    const handleEditTask = (task) => {
        setEditingTask(task);

        setTitle(task.title || "");
        setDescription(
            task.description || ""
        );

        setStatus(
            task.status || "todo"
        );

        setPriority(
            task.priority || "medium"
        );

        setDueDate(
            task.dueDate
                ? task.dueDate.substring(0, 10)
                : ""
        );

        setShowTaskModal(true);
    };

    // =====================================================
    // RESET FILTERS
    // =====================================================

    const resetFilters = () => {
        setSearch("");
        setFilterStatus("all");
        setFilterPriority("all");
    };

    // =====================================================
    // NAVIGATION
    // =====================================================

    const handleNavigation = (page) => {
        setActivePage(page);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // =====================================================
    // LOAD TASKS AFTER LOGIN
    // =====================================================

    useEffect(() => {
        if (isLoggedIn) {
            fetchTasks();
        }
    }, [isLoggedIn]);

    // =====================================================
    // LOGIN / REGISTER
    // =====================================================

    if (!isLoggedIn) {
        if (showRegister) {
            return (
                <Register
                    onRegister={() => {
                        setShowRegister(false);
                    }}
                    goToLogin={() => {
                        setShowRegister(false);
                    }}
                />
            );
        }

        return (
            <Login
                onLogin={(loggedInUser) => {
                    if (loggedInUser) {
                        setUser(loggedInUser);

                        localStorage.setItem(
                            "user",
                            JSON.stringify(
                                loggedInUser
                            )
                        );
                    }

                    setIsLoggedIn(true);
                }}
                goToRegister={() => {
                    setShowRegister(true);
                }}
            />
        );
    }

    // =====================================================
    // PAGE INFORMATION
    // =====================================================

    const pageInfo = {
        dashboard: {
            title: "Dashboard",
            subtitle:
                "Manage your tasks and stay productive."
        },

        tasks: {
            title: "My Tasks",
            subtitle:
                "View, search and manage all your tasks."
        },

        important: {
            title: "Important",
            subtitle:
                "Your high-priority tasks in one place."
        }
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="app">

            {/* =================================================
                SIDEBAR
            ================================================= */}

            <aside className="sidebar">

                {/* LOGO */}

                <div className="logo">
                    <div className="logo-icon">
                        ✓
                    </div>

                    <span>
                        TaskFlow
                    </span>
                </div>

                {/* NAVIGATION */}

                <nav className="navigation">

                    <button
                        className={`nav-item ${
                            activePage === "dashboard"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation(
                                "dashboard"
                            )
                        }
                    >
                        <span>▦</span>

                        <span className="nav-text">
                            Dashboard
                        </span>
                    </button>

                    <button
                        className={`nav-item ${
                            activePage === "tasks"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation(
                                "tasks"
                            )
                        }
                    >
                        <span>✓</span>

                        <span className="nav-text">
                            My Tasks
                        </span>
                    </button>

                    <button
                        className={`nav-item ${
                            activePage === "important"
                                ? "active"
                                : ""
                        }`}
                        onClick={() =>
                            handleNavigation(
                                "important"
                            )
                        }
                    >
                        <span>★</span>

                        <span className="nav-text">
                            Important
                        </span>
                    </button>

                </nav>

                {/* SIDEBAR USER */}

                <div className="sidebar-bottom">

                    <div className="user-box">

                        <div className="avatar">
                            {user?.name
                                ? user.name
                                      .charAt(0)
                                      .toUpperCase()
                                : "U"}
                        </div>

                        <div className="user-info">
                            <strong>
                                {user?.name ||
                                    "User"}
                            </strong>

                            <small>
                                Member
                            </small>
                        </div>

                    </div>

                    <button
                        className="logout-button"
                        onClick={() => {
                            localStorage.removeItem(
                                "token"
                            );

                            localStorage.removeItem(
                                "user"
                            );

                            setUser(null);
                            setTasks([]);
                            setIsLoggedIn(false);
                        }}
                    >
                        Logout
                    </button>

                </div>

            </aside>

            {/* =================================================
                MAIN CONTENT
            ================================================= */}

            <main className="main-content">

                {/* TOPBAR */}

                <header className="topbar">

                    <div className="page-heading">

                        <h1>
                            {
                                pageInfo[
                                    activePage
                                ].title
                            }
                        </h1>

                        <p>
                            {
                                pageInfo[
                                    activePage
                                ].subtitle
                            }
                        </p>

                    </div>

                    <div className="topbar-right">

                        <button
                            className="notification"
                            title="Notifications"
                        >
                            🔔
                        </button>

                        <div className="profile">

                            <div className="avatar">
                                {user?.name
                                    ? user.name
                                          .charAt(0)
                                          .toUpperCase()
                                    : "U"}
                            </div>

                            <div>
                                <strong>
                                    {user?.name ||
                                        "User"}
                                </strong>

                                <small>
                                    My Account
                                </small>
                            </div>

                        </div>

                    </div>

                </header>

                {/* =================================================
                    DASHBOARD
                ================================================= */}

                {activePage === "dashboard" && (
                    <>

                        {/* WELCOME */}

                        <section className="welcome-section">

                            <div className="welcome-content">

                                <span className="welcome-label">
                                    TODAY'S OVERVIEW
                                </span>

                                <h2>
                                    Hi!{" "}
                                    {user?.name ||
                                        "User"}{" "}
                                    👋
                                </h2>

                                <p>
                                    Here's what's
                                    happening with
                                    your tasks today.
                                </p>

                            </div>

                            <button
                                className="add-button"
                                onClick={
                                    openAddModal
                                }
                            >
                                <span>＋</span>
                                Add New Task
                            </button>

                        </section>

                        {/* STATISTICS */}

                        <section className="stats-grid">

                            <div className="stat-card">
                                <div className="stat-icon">
                                    📋
                                </div>

                                <div>
                                    <span>
                                        Total Tasks
                                    </span>

                                    <h3>
                                        {totalTasks}
                                    </h3>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    📝
                                </div>

                                <div>
                                    <span>
                                        To Do
                                    </span>

                                    <h3>
                                        {todoTasks}
                                    </h3>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    ⚡
                                </div>

                                <div>
                                    <span>
                                        In Progress
                                    </span>

                                    <h3>
                                        {inProgressTasks}
                                    </h3>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">
                                    ✓
                                </div>

                                <div>
                                    <span>
                                        Completed
                                    </span>

                                    <h3>
                                        {completedTasks}
                                    </h3>
                                </div>
                            </div>

                        </section>

                        {/* PROGRESS */}

                        <section className="progress-card">

                            <div className="progress-header">

                                <div>
                                    <h2>
                                        Task Progress
                                    </h2>

                                    <p>
                                        Your overall
                                        task completion
                                    </p>
                                </div>

                                <strong>
                                    {
                                        completionPercentage
                                    }%
                                </strong>

                            </div>

                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{
                                        width: `${completionPercentage}%`
                                    }}
                                />
                            </div>

                            <div className="progress-info">
                                <span>
                                    {completedTasks} of{" "}
                                    {totalTasks}{" "}
                                    tasks completed
                                </span>

                                <span>
                                    {highPriorityTasks}{" "}
                                    high priority
                                </span>
                            </div>

                        </section>

                        {/* RECENT TASKS */}

                        <TaskSection
                            title="Recent Tasks"
                            subtitle="Your latest tasks"
                            tasks={tasks.slice(0, 5)}
                            loading={loading}
                            onAdd={openAddModal}
                            onEdit={handleEditTask}
                            onDelete={
                                handleDeleteTask
                            }
                        />

                    </>
                )}

                {/* =================================================
                    MY TASKS
                ================================================= */}

                {activePage === "tasks" && (
                    <TaskSection
                        title="All My Tasks"
                        subtitle={`${filteredTasks.length} task${
                            filteredTasks.length !== 1
                                ? "s"
                                : ""
                        } shown`}
                        tasks={filteredTasks}
                        loading={loading}
                        onAdd={openAddModal}
                        onEdit={handleEditTask}
                        onDelete={
                            handleDeleteTask
                        }
                        search={search}
                        setSearch={setSearch}
                        filterStatus={
                            filterStatus
                        }
                        setFilterStatus={
                            setFilterStatus
                        }
                        filterPriority={
                            filterPriority
                        }
                        setFilterPriority={
                            setFilterPriority
                        }
                        onReset={
                            resetFilters
                        }
                        showFilters={true}
                    />
                )}

                {/* =================================================
                    IMPORTANT
                ================================================= */}

                {activePage === "important" && (
                    <TaskSection
                        title="Important Tasks"
                        subtitle={`${importantTasks.length} high-priority task${
                            importantTasks.length !== 1
                                ? "s"
                                : ""
                        }`}
                        tasks={importantTasks}
                        loading={loading}
                        onAdd={openAddModal}
                        onEdit={handleEditTask}
                        onDelete={
                            handleDeleteTask
                        }
                    />
                )}

            </main>

            {/* =================================================
                TASK MODAL
            ================================================= */}

            {showTaskModal && (
                <div
                    className="modal-overlay"
                    onMouseDown={(e) => {
                        if (
                            e.target ===
                            e.currentTarget
                        ) {
                            closeTaskModal();
                        }
                    }}
                >

                    <div className="task-modal">

                        {/* MODAL HEADER */}

                        <div className="modal-header">

                            <div>
                                <span className="modal-icon">
                                    {editingTask
                                        ? "✏️"
                                        : "＋"}
                                </span>

                                <div>
                                    <h2>
                                        {editingTask
                                            ? "Edit Task"
                                            : "Create New Task"}
                                    </h2>

                                    <p>
                                        {editingTask
                                            ? "Update your task details."
                                            : "Add a new task to your workspace."}
                                    </p>
                                </div>
                            </div>

                            <button
                                className="modal-close"
                                onClick={
                                    closeTaskModal
                                }
                                type="button"
                            >
                                ×
                            </button>

                        </div>

                        {/* FORM */}

                        <form
                            className="task-form"
                            onSubmit={
                                handleTaskSubmit
                            }
                        >

                            <div className="form-group">

                                <label>
                                    Task Title
                                </label>

                                <input
                                    type="text"
                                    placeholder="Enter task title"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(
                                            e.target.value
                                        )
                                    }
                                    required
                                    autoFocus
                                />

                            </div>

                            <div className="form-group">

                                <label>
                                    Description
                                </label>

                                <textarea
                                    placeholder="Describe your task..."
                                    value={
                                        description
                                    }
                                    onChange={(e) =>
                                        setDescription(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            <div className="form-row">

                                <div className="form-group">

                                    <label>
                                        Status
                                    </label>

                                    <select
                                        value={status}
                                        onChange={(e) =>
                                            setStatus(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="todo">
                                            To Do
                                        </option>

                                        <option value="in-progress">
                                            In Progress
                                        </option>

                                        <option value="completed">
                                            Completed
                                        </option>
                                    </select>

                                </div>

                                <div className="form-group">

                                    <label>
                                        Priority
                                    </label>

                                    <select
                                        value={
                                            priority
                                        }
                                        onChange={(e) =>
                                            setPriority(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="low">
                                            Low
                                        </option>

                                        <option value="medium">
                                            Medium
                                        </option>

                                        <option value="high">
                                            High
                                        </option>
                                    </select>

                                </div>

                            </div>

                            <div className="form-group">

                                <label>
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) =>
                                        setDueDate(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>

                            {/* MODAL ACTIONS */}

                            <div className="modal-actions">

                                <button
                                    type="button"
                                    className="cancel-button"
                                    onClick={
                                        closeTaskModal
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="create-button"
                                    disabled={loading}
                                >
                                    {loading
                                        ? "Saving..."
                                        : editingTask
                                            ? "Update Task"
                                            : "Create Task"}
                                </button>

                            </div>

                        </form>

                    </div>

                </div>
            )}

        </div>
    );
}


/* =========================================================
   TASK SECTION COMPONENT
========================================================= */

function TaskSection({
    title,
    subtitle,
    tasks,
    loading,
    onAdd,
    onEdit,
    onDelete,
    search = "",
    setSearch,
    filterStatus = "all",
    setFilterStatus,
    filterPriority = "all",
    setFilterPriority,
    onReset,
    showFilters = false
}) {
    return (
        <section className="tasks-section">

            <div className="section-heading">

                <div>
                    <h2>
                        {title}
                    </h2>

                    <p>
                        {subtitle}
                    </p>
                </div>

                <button
                    className="small-add-button"
                    onClick={onAdd}
                >
                    ＋ Add Task
                </button>

            </div>

            {/* FILTERS */}

            {showFilters && (
                <div className="filter-section">

                    <input
                        type="text"
                        placeholder="🔍 Search tasks..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    <select
                        value={filterStatus}
                        onChange={(e) =>
                            setFilterStatus(
                                e.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Status
                        </option>

                        <option value="todo">
                            To Do
                        </option>

                        <option value="in-progress">
                            In Progress
                        </option>

                        <option value="completed">
                            Completed
                        </option>
                    </select>

                    <select
                        value={filterPriority}
                        onChange={(e) =>
                            setFilterPriority(
                                e.target.value
                            )
                        }
                    >
                        <option value="all">
                            All Priority
                        </option>

                        <option value="low">
                            Low
                        </option>

                        <option value="medium">
                            Medium
                        </option>

                        <option value="high">
                            High
                        </option>
                    </select>

                    <button
                        className="reset-button"
                        onClick={onReset}
                    >
                        Reset
                    </button>

                </div>
            )}

            {/* TASK LIST */}

            <div className="task-list">

                {loading && tasks.length === 0 ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>

                        <p>
                            Loading tasks...
                        </p>
                    </div>
                ) : tasks.length === 0 ? (

                    <div className="empty-state">

                        <div className="empty-icon">
                            📋
                        </div>

                        <h3>
                            No tasks found
                        </h3>

                        <p>
                            {showFilters
                                ? "Try changing your search or filters."
                                : "Create your first task to get started."}
                        </p>

                        <button
                            className="empty-add-button"
                            onClick={onAdd}
                        >
                            ＋ Create Task
                        </button>

                    </div>

                ) : (

                    tasks.map((task) => (
                        <div
                            className="task-card"
                            key={task._id}
                        >

                            <div className="task-main">

                                <div
                                    className={`task-check ${
                                        task.status ===
                                        "completed"
                                            ? "completed"
                                            : ""
                                    }`}
                                >
                                    {task.status ===
                                    "completed"
                                        ? "✓"
                                        : "○"}
                                </div>

                                <div className="task-content">

                                    <h3>
                                        {task.title}
                                    </h3>

                                    <p>
                                        {task.description ||
                                            "No description"}
                                    </p>

                                </div>

                            </div>

                            <div className="task-details">

                                <span
                                    className={`status-badge ${task.status}`}
                                >
                                    {task.status ===
                                    "in-progress"
                                        ? "In Progress"
                                        : task.status ===
                                          "todo"
                                            ? "To Do"
                                            : "Completed"}
                                </span>

                                <span
                                    className={`priority-badge ${task.priority}`}
                                >
                                    {task.priority}
                                </span>

                                <span className="due-date">
                                    📅{" "}
                                    {task.dueDate
                                        ? new Date(
                                              task.dueDate
                                          ).toLocaleDateString()
                                        : "No date"}
                                </span>

                                <button
                                    className="edit-button"
                                    onClick={() =>
                                        onEdit(task)
                                    }
                                    title="Edit task"
                                >
                                    ✏️
                                </button>

                                <button
                                    className="delete-button"
                                    onClick={() =>
                                        onDelete(
                                            task._id
                                        )
                                    }
                                    title="Delete task"
                                >
                                    🗑️
                                </button>

                            </div>

                        </div>
                    ))

                )}

            </div>

        </section>
    );
}

export default App;