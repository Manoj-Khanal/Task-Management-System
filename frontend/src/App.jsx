import { useEffect, useState } from "react";
import "./App.css";
import Login from "./Login.jsx";
import Register from "./Register.jsx";

function App() {

    // =========================
    // Login State
    // =========================

    const [isLoggedIn, setIsLoggedIn] = useState(
        !!localStorage.getItem("token")
    );

    const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
});

    const [showRegister, setShowRegister] = useState(false);

    // =========================
    // Tasks
    // =========================

    const [tasks, setTasks] = useState([]);

    // =========================
    // Search & Filters
    // =========================

    const [search, setSearch] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterPriority, setFilterPriority] = useState("all");

    // =========================
    // Task Form
    // =========================

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("todo");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");

    // =========================
    // Edit Task
    // =========================

    const [editingTask, setEditingTask] = useState(null);

    // =========================
    // Get Token
    // =========================

    const token = localStorage.getItem("token");


    // =========================
    // Dashboard Statistics
    // =========================

    const totalTasks = tasks.length;

    const todoTasks = tasks.filter(
        task => task.status === "todo"
    ).length;

    const inProgressTasks = tasks.filter(
        task => task.status === "in-progress"
    ).length;

    const completedTasks = tasks.filter(
        task => task.status === "completed"
    ).length;

    const highPriorityTasks = tasks.filter(
        task => task.priority === "high"
    ).length;

    const completionPercentage =
        totalTasks === 0
            ? 0
            : Math.round(
                (completedTasks / totalTasks) * 100
            );


    // =========================
    // Search & Filter
    // =========================

    const filteredTasks = tasks.filter((task) => {

        const matchesSearch =
            task.title
                .toLowerCase()
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


    // =========================
    // Get Tasks
    // =========================

    const fetchTasks = async () => {

        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            return;
        }

        try {

            const response = await fetch(
                "https://task-management-system-1gvk.onrender.com",
                {
                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                setTasks(data.tasks);

            } else {

                alert(data.message);

                if (response.status === 401) {

                    localStorage.removeItem("token");
                    setIsLoggedIn(false);

                }
            }

        } catch (error) {

            console.error(error);

        }
    };


    // =========================
    // Add / Update Task
    // =========================

    const handleAddTask = async (e) => {

        e.preventDefault();

        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            setIsLoggedIn(false);
            return;
        }

        try {

            // =========================
            // UPDATE TASK
            // =========================

            if (editingTask) {

                const response = await fetch(
                    `https://task-management-system-1gvk.onrender.com/api/tasks/${id}`,
                    {
                        method: "PUT",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${currentToken}`
                        },

                        body: JSON.stringify({
                            title,
                            description,
                            status,
                            priority,
                            dueDate
                        })
                    }
                );

                const data = await response.json();

                if (response.ok) {

                    setEditingTask(null);

                    setTitle("");
                    setDescription("");
                    setStatus("todo");
                    setPriority("medium");
                    setDueDate("");

                    fetchTasks();

                } else {

                    alert(data.message);

                }

            }

            // =========================
            // CREATE TASK
            // =========================

            else {

                const response = await fetch(
                    "https://task-management-system-1gvk.onrender.com",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${currentToken}`
                        },

                        body: JSON.stringify({
                            title,
                            description,
                            status,
                            priority,
                            dueDate
                        })
                    }
                );

                const data = await response.json();

                if (response.ok) {

                    setTitle("");
                    setDescription("");
                    setStatus("todo");
                    setPriority("medium");
                    setDueDate("");

                    fetchTasks();

                } else {

                    alert(data.message);

                }
            }

        } catch (error) {

            console.error(error);

            alert("Unable to connect to server");

        }
    };


    // =========================
    // Delete Task
    // =========================

    const handleDeleteTask = async (id) => {

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this task?"
        );

        if (!confirmDelete) {
            return;
        }

        const currentToken = localStorage.getItem("token");

        if (!currentToken) {
            setIsLoggedIn(false);
            return;
        }

        try {

            const response = await fetch(
                `https://task-management-system-1gvk.onrender.com/api/tasks/${id}`,
                {
                    method: "DELETE",

                    headers: {
                        Authorization: `Bearer ${currentToken}`
                    }
                }
            );

            const data = await response.json();

            if (response.ok) {

                fetchTasks();

            } else {

                alert(data.message);

            }

        } catch (error) {

            console.error(error);

            alert("Unable to connect to server");

        }
    };


    // =========================
    // Edit Task
    // =========================

    const handleEditTask = (task) => {

        setEditingTask(task);

        setTitle(task.title);
        setDescription(task.description || "");
        setStatus(task.status);
        setPriority(task.priority);

        setDueDate(
            task.dueDate
                ? task.dueDate.substring(0, 10)
                : ""
        );

        document
            .getElementById("add-task")
            .scrollIntoView({
                behavior: "smooth"
            });
    };


    // =========================
    // Load Tasks After Login
    // =========================

    useEffect(() => {

        if (isLoggedIn) {
            fetchTasks();
        }

    }, [isLoggedIn]);


    // =========================
    // Show Login
    // =========================

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
        setUser(loggedInUser);
        setIsLoggedIn(true);
    }}
    goToRegister={() => {
        setShowRegister(true);
    }}
/> );
}

    // =========================
    // Dashboard
    // =========================

    return (

        <div className="app">

            {/* ========================= */}
            {/* Sidebar */}
            {/* ========================= */}

            <aside className="sidebar">

                <div className="logo">

                    <div className="logo-icon">
                        ✓
                    </div>

                    <span>
                        TaskFlow
                    </span>

                </div>


                <nav className="navigation">

                    <a className="nav-item active">

                        <span>
                            ▦
                        </span>

                        Dashboard

                    </a>


                    <a className="nav-item">

                        <span>
                            ✓
                        </span>

                        My Tasks

                    </a>


                    <a className="nav-item">

                        <span>
                            ★
                        </span>

                        Important

                    </a>

                </nav>


                <div className="sidebar-bottom">

                    <div className="user-box">

                        <div className="avatar">
                            M
                        </div>

                        <div>

                            <strong>
                                Manoj
                            </strong>

                            <small>
                                Member
                            </small>

                        </div>

                    </div>


                    <button
                        className="logout-button"
                        onClick={() => {

                            localStorage.removeItem("token");
                            localStorage.removeItem("user");
                            setUser(null);
                            setTasks([]);
                            setTasks([]);

                            setIsLoggedIn(false);

                        }}
                    >
                        Logout
                    </button>

                </div>

            </aside>


            {/* ========================= */}
            {/* Main Content */}
            {/* ========================= */}

            <main className="main-content">


                {/* ========================= */}
                {/* Topbar */}
                {/* ========================= */}

                <header className="topbar">

                    <div>

                        <h1>
                            Dashboard
                        </h1>

                        <p>
                            Manage your tasks and stay productive.
                        </p>

                    </div>


                    <div className="topbar-right">

                        <div className="notification">
                            🔔
                        </div>


                        <div className="profile">

                            <div className="avatar">
                                M
                            </div>

                            <div>

                                <strong>
                                    Manoj
                                </strong>

                                <small>
                                    My Account
                                </small>

                            </div>

                        </div>

                    </div>

                </header>


                {/* ========================= */}
                {/* Welcome */}
                {/* ========================= */}

                <section className="welcome-section">

                    <div>

                        <h2> Hi! {user?.name || "User"} 👋</h2>

                        <p>
                            Here's what's happening with your tasks today.
                        </p>

                    </div>


                    <button
                        className="add-button"
                        onClick={() =>
                            document
                                .getElementById("add-task")
                                .scrollIntoView({
                                    behavior: "smooth"
                                })
                        }
                    >
                        + Add New Task
                    </button>

                </section>


                {/* ========================= */}
                {/* Statistics */}
                {/* ========================= */}

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


                {/* ========================= */}
                {/* Task Progress */}
                {/* ========================= */}

                <section className="progress-card">

                    <div className="progress-header">

                        <div>

                            <h2>
                                Task Progress
                            </h2>

                            <p>
                                Your overall task completion
                            </p>

                        </div>


                        <strong>
                            {completionPercentage}%
                        </strong>

                    </div>


                    <div className="progress-bar">

                        <div
                            className="progress-fill"
                            style={{
                                width: `${completionPercentage}%`
                            }}
                        ></div>

                    </div>


                    <div className="progress-info">

                        <span>
                            {completedTasks} of {totalTasks} tasks completed
                        </span>

                        <span>
                            {highPriorityTasks} high priority
                        </span>

                    </div>

                </section>


                {/* ========================= */}
                {/* Add / Edit Task */}
                {/* ========================= */}

                <section
                    className="add-task-card"
                    id="add-task"
                >

                    <div className="section-heading">

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


                    <form
                        className="task-form"
                        onSubmit={handleAddTask}
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
                                    setTitle(e.target.value)
                                }
                                required
                            />

                        </div>


                        <div className="form-group">

                            <label>
                                Description
                            </label>

                            <textarea
                                placeholder="Describe your task..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
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
                                        setStatus(e.target.value)
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
                                    value={priority}
                                    onChange={(e) =>
                                        setPriority(e.target.value)
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


                            <div className="form-group">

                                <label>
                                    Due Date
                                </label>

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) =>
                                        setDueDate(e.target.value)
                                    }
                                />

                            </div>

                        </div>


                        <button
                            type="submit"
                            className="create-button"
                        >
                            {editingTask
                                ? "Update Task"
                                : "Create Task"}
                        </button>


                        {editingTask && (

                            <button
                                type="button"
                                className="reset-button"
                                onClick={() => {

                                    setEditingTask(null);

                                    setTitle("");
                                    setDescription("");
                                    setStatus("todo");
                                    setPriority("medium");
                                    setDueDate("");

                                }}
                            >
                                Cancel Edit
                            </button>

                        )}

                    </form>

                </section>


                {/* ========================= */}
                {/* Tasks */}
                {/* ========================= */}

                <section className="tasks-section">


                    <div className="section-heading">

                        <div>

                            <h2>
                                My Tasks
                            </h2>

                            <p>
                                {filteredTasks.length} task
                                {filteredTasks.length !== 1
                                    ? "s"
                                    : ""} shown
                            </p>

                        </div>

                    </div>


                    {/* ========================= */}
                    {/* Search & Filters */}
                    {/* ========================= */}

                    <div className="filter-section">


                        <input
                            type="text"
                            placeholder="🔍 Search tasks..."
                            value={search}
                            onChange={(e) =>
                                setSearch(e.target.value)
                            }
                        />


                        <select
                            value={filterStatus}
                            onChange={(e) =>
                                setFilterStatus(e.target.value)
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
                                setFilterPriority(e.target.value)
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
                            onClick={() => {

                                setSearch("");
                                setFilterStatus("all");
                                setFilterPriority("all");

                            }}
                        >
                            Reset
                        </button>

                    </div>


                    {/* ========================= */}
                    {/* Task List */}
                    {/* ========================= */}

                    <div className="task-list">


                        {filteredTasks.length === 0 ? (

                            <div className="empty-state">

                                <div className="empty-icon">
                                    📋
                                </div>

                                <h3>
                                    No matching tasks
                                </h3>

                                <p>
                                    Try changing your search or filters.
                                </p>

                            </div>

                        ) : (

                            filteredTasks.map((task) => (

                                <div
                                    className="task-card"
                                    key={task._id}
                                >


                                    <div className="task-main">

                                        <div className="task-check">

                                            {task.status === "completed"
                                                ? "✓"
                                                : "○"}

                                        </div>


                                        <div>

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

                                            {task.status === "in-progress"
                                                ? "In Progress"
                                                : task.status === "todo"
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


                                        {/* Edit */}

                                        <button
                                            className="edit-button"
                                            onClick={() =>
                                                handleEditTask(task)
                                            }
                                        >
                                            ✏️
                                        </button>


                                        {/* Delete */}

                                        <button
                                            className="delete-button"
                                            onClick={() =>
                                                handleDeleteTask(
                                                    task._id
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

                </section>

            </main>

        </div>
    );
}

export default App;