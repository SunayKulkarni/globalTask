const express = require('express');
const cors = require('cors');
const { randomUUID } = require('crypto');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

const tasks = [];

function findTaskIndex(taskId) {
  return tasks.findIndex((task) => task.id === taskId);
}

function buildTask(title) {
  return {
    id: randomUUID(),
    title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
}

app.get('/tasks', (_req, res) => {
  return res.status(200).json({
    data: tasks,
  });
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'title is required and must be a non-empty string.',
    });
  }

  const newTask = buildTask(title.trim());
  tasks.push(newTask);

  return res.status(201).json({
    message: 'Task created successfully.',
    data: newTask,
  });
});

app.patch('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { completed } = req.body;

  if (typeof completed !== 'boolean') {
    return res.status(400).json({
      error: 'ValidationError',
      message: 'completed is required and must be a boolean.',
    });
  }

  const taskIndex = findTaskIndex(id);
  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'NotFound',
      message: 'Task not found.',
    });
  }

  tasks[taskIndex].completed = completed;

  return res.status(200).json({
    message: 'Task updated successfully.',
    data: tasks[taskIndex],
  });
});

app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const taskIndex = findTaskIndex(id);

  if (taskIndex === -1) {
    return res.status(404).json({
      error: 'NotFound',
      message: 'Task not found.',
    });
  }

  tasks.splice(taskIndex, 1);

  return res.status(200).json({
    message: 'Task deleted successfully.',
  });
});

app.use((_req, res) => {
  return res.status(404).json({
    error: 'NotFound',
    message: 'Route not found.',
  });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Something went wrong.',
  });
});

app.listen(PORT, () => {
  console.log(`Task API server running on http://localhost:${PORT}`);
});
