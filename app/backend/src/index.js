require("dotenv").config();

const express = require("express");
const cors = require("cors");
const client = require("prom-client");
const pool = require("./db");

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status"],
});

register.registerMetric(httpRequestsTotal);

app.use((req, res, next) => {
  res.on("finish", () => {
    const route = req.route?.path || req.path || "unknown";
    httpRequestsTotal.inc({
      method: req.method,
      route,
      status: res.statusCode,
    });
  });
  next();
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.status(200).json({ status: "ok", database: "connected" });
  } catch (error) {
    res.status(500).json({ status: "error", database: "disconnected" });
  }
});

app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.get("/tasks", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM tasks ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    console.error("GET /tasks error:", error.message);
    res.status(500).json({ error: "Failed to fetch tasks" });
  }
});

app.post("/tasks", async (req, res) => {
  try {
    const { title } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: "Title is required" });
    }

    const result = await pool.query(
      "INSERT INTO tasks (title) VALUES ($1) RETURNING *",
      [title.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("POST /tasks error:", error.message);
    res.status(500).json({ error: "Failed to create task" });
  }
});

app.put("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { completed, title } = req.body;

    const existing = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);

    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    const currentTask = existing.rows[0];
    const newTitle = title !== undefined ? title : currentTask.title;
    const newCompleted =
      completed !== undefined ? completed : currentTask.completed;

    const result = await pool.query(
      "UPDATE tasks SET title = $1, completed = $2 WHERE id = $3 RETURNING *",
      [newTitle, newCompleted, id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("PUT /tasks/:id error:", error.message);
    res.status(500).json({ error: "Failed to update task" });
  }
});

app.delete("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM tasks WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({ message: "Task deleted", task: result.rows[0] });
  } catch (error) {
    console.error("DELETE /tasks/:id error:", error.message);
    res.status(500).json({ error: "Failed to delete task" });
  }
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
