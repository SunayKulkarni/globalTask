# Task Manager Assignment

Small full-stack Task Manager app built with React (frontend) and Node.js + Express (backend).

## Features

- List tasks
- Add a new task
- Mark a task as completed/incomplete
- Delete a task
- Loading and error states in UI
- Backend request validation with clear JSON responses

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Storage: In-memory array (resets when backend restarts)

## Project Structure

- `backend` - REST API server
- `frontend` - React client

## Run Locally

### 1) Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### 2) Start backend

```bash
cd backend
npm run start
```

Backend runs at `http://localhost:4000`.

### 3) Start frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173` by default.

If your backend runs on a different host/port, set `VITE_API_URL` in `frontend/.env`.

## API Endpoints

- `GET /tasks` - Return all tasks
- `POST /tasks` - Create a task. Body: `{ "title": "Task title" }`
- `PATCH /tasks/:id` - Update completed status. Body: `{ "completed": true }`
- `DELETE /tasks/:id` - Delete a task

## Notes, Assumptions, Trade-offs

- IDs are generated with `crypto.randomUUID()`.
- `createdAt` is ISO date string.
- Validation is intentionally basic (`title` must be non-empty string, `completed` must be boolean).
- Data persistence is not implemented to keep scope small for a 1-2 hour assignment.
- Optional bonus features (filters, edit title, tests, Docker) were not included to prioritize core requirements.
