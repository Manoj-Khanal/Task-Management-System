const express = require("express");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

const router = express.Router();

// =========================
// Create Task
// =========================
router.post("/", async (req, res) => {
    try {
        // Get token from request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Get task details
        const {
            title,
            description,
            status,
            priority,
            dueDate
        } = req.body;

        // Check title
        if (!title) {
            return res.status(400).json({
                message: "Task title is required"
            });
        }

        // Create task
        const task = await Task.create({
            title,
            description,
            status,
            priority,
            dueDate,
            user: decoded.userId
        });

        res.status(201).json({
            message: "Task created successfully",
            task
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// =========================
// Get All Tasks
// =========================
router.get("/", async (req, res) => {
    try {
        // Get token from request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find tasks belonging to this user
        const tasks = await Task.find({
            user: decoded.userId
        }).sort({ createdAt: -1 });

        res.json({
            message: "Tasks fetched successfully",
            tasks
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// =========================
// Update Task
// =========================
router.put("/:id", async (req, res) => {
    try {
        // Get token from request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Find task belonging to this user
        const task = await Task.findOne({
            _id: req.params.id,
            user: decoded.userId
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        // Update task fields
        const {
            title,
            description,
            status,
            priority,
            dueDate
        } = req.body;

        if (title !== undefined) task.title = title;
        if (description !== undefined) task.description = description;
        if (status !== undefined) task.status = status;
        if (priority !== undefined) task.priority = priority;
        if (dueDate !== undefined) task.dueDate = dueDate;

        await task.save();

        res.json({
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});

// =========================
// Delete Task
// =========================
router.delete("/:id", async (req, res) => {
    try {
        // Get token from request header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "No token provided"
            });
        }

        const token = authHeader.split(" ")[1];

        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // Delete task belonging to this user
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: decoded.userId
        });

        if (!task) {
            return res.status(404).json({
                message: "Task not found"
            });
        }

        res.json({
            message: "Task deleted successfully"
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


module.exports = router;