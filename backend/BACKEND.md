# NoteTaking WebApp Backend

This document describes the backend process, project structure, database model, and REST APIs used by the NoteTaking WebApp.

## 1. Backend Overview

The backend is an ES module-based Node.js application built with:

- **Express**: creates the HTTP server and routes requests.
- **Mongoose**: defines the note schema and communicates with MongoDB.
- **dotenv**: loads configuration from the `.env` file.
- **Nodemon**: restarts the development server when source files change.

The application starts in `index.js`, connects to MongoDB, registers JSON parsing, mounts the notes router, and listens on the configured port.

## 2. Project Structure

```text
backend/
├── index.js                       # Application entry point and server setup
├── package.json                   # Dependencies and npm scripts
├── .env                           # Local environment variables
├── controllers/
│   └── note.controller.js        # Business logic for note operations
├── models/
│   └── note.model.js             # Mongoose Note schema and model
└── routes/
    └── note.route.js             # Note endpoint definitions
```

### Request flow

```text
Client request
    ↓
Express server (index.js)
    ↓
JSON middleware
    ↓
Notes router (/api/v1/notesapp)
    ↓
Controller function
    ↓
Mongoose Note model
    ↓
MongoDB
    ↓
JSON response
```

## 3. Installation and Configuration

### Prerequisites

- Node.js and npm
- A running MongoDB instance or MongoDB Atlas database

### Install dependencies

From the `backend` directory, run:

```bash
npm install
```

### Environment variables

Create or update `backend/.env` with values appropriate for the local environment:

```env
PORT=4002
MONGO_URL=<your-mongodb-connection-string>
```

`PORT` is optional because the application defaults to `4002`. `MONGO_URL` is required for database operations. Do not commit real credentials or connection strings to source control.

### Start the server

```bash
npm start
```

The `start` script runs `nodemon index.js`. A successful startup uses the configured port and attempts to connect to MongoDB.

The base URL is:

```text
http://localhost:4002/api/v1/notesapp
```

If a different port is configured, replace `4002` in the URL.

## 4. Server and Database Setup

In `index.js`, the application performs these steps:

1. Loads variables from `.env` using `dotenv.config()`.
2. Creates an Express application.
3. Connects to MongoDB with `mongoose.connect()`.
4. Enables `express.json()` so JSON request bodies are available as `req.body`.
5. Mounts the notes router at `/api/v1/notesapp`.
6. Starts listening on `PORT`, or `4002` when no port is configured.

MongoDB connection events are logged for connected, error, and disconnected states. The connection uses a 10-second server-selection timeout.

## 5. Note Data Model

The `Note` model is backed by the following Mongoose schema:

| Field | Type | Required | Behavior |
|---|---|---:|---|
| `title` | String | Yes | Leading and trailing whitespace is trimmed |
| `content` | String | Yes | Stores the note body |
| `createdAt` | Date | Automatically generated | Added by Mongoose timestamps |
| `updatedAt` | Date | Automatically generated | Added by Mongoose timestamps |
|
MongoDB also generates an `_id` value for each note.

Example note:

```json
{
  "_id": "665c7f1d8f1d8f1d8f1d8f1d",
  "title": "Shopping list",
  "content": "Milk and bread",
  "createdAt": "2026-08-28T10:00:00.000Z",
  "updatedAt": "2026-08-28T10:00:00.000Z"
}
```

## 6. API Endpoints

All endpoints use the common prefix:

```text
/api/v1/notesapp
```

Unless stated otherwise, request and response bodies use `application/json`.

### 6.1 Create a note

**Endpoint**

```http
POST /api/v1/notesapp/create-note
```

**Request body**

Both `title` and `content` are required.

```json
{
  "title": "Shopping list",
  "content": "Milk and bread"
}
```

**Success response: `201 Created`**

Returns the newly saved note, including its generated `_id` and timestamps.

**Validation response: `400 Bad Request`**

Returned when either `title` or `content` is missing or empty:

```json
{
  "message": "Title and Content are required"
}
```

**Example**

```bash
curl -X POST http://localhost:4002/api/v1/notesapp/create-note \
  -H "Content-Type: application/json" \
  -d '{"title":"Shopping list","content":"Milk and bread"}'
```

### 6.2 Get all notes

**Endpoint**

```http
GET /api/v1/notesapp/get-notes
```

No request body is required.

**Success response: `200 OK`**

Returns an array of notes sorted by `createdAt` in descending order, so the newest notes appear first.

```json
[
  {
    "_id": "665c7f1d8f1d8f1d8f1d8f1d",
    "title": "Shopping list",
    "content": "Milk and bread",
    "createdAt": "2026-08-28T10:00:00.000Z",
    "updatedAt": "2026-08-28T10:00:00.000Z"
  }
]
```

**Example**

```bash
curl http://localhost:4002/api/v1/notesapp/get-notes
```

### 6.3 Update a note

**Endpoint**

```http
PUT /api/v1/notesapp/update-note/:id
```

Replace `:id` with the MongoDB `_id` of the note.

**Intended request body**

```json
{
  "title": "Updated shopping list",
  "content": "Milk, bread, and fruit"
}
```

**Success response: `200 OK`**

Returns the updated note when a matching document is found.

**Not-found response: `404 Not Found`**

```json
{
  "message": "No changes found"
}
```

**Example**

```bash
curl -X PUT http://localhost:4002/api/v1/notesapp/update-note/665c7f1d8f1d8f1d8f1d8f1d \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated shopping list","content":"Milk, bread, and fruit"}'
```

> **Current implementation note:** `controllers/note.controller.js` currently reads `titile` and updates `titile`, while the schema and create endpoint use `title`. Clients should send `title` according to the intended API contract, but update behavior should be corrected in the controller before relying on title updates.

### 6.4 Delete a note

**Endpoint**

```http
DELETE /api/v1/notesapp/delete-note/:id
```

Replace `:id` with the MongoDB `_id` of the note. No request body is required.

**Success response: `200 OK`**

```json
{
  "message": "Note deleted successfully"
}
```

**Not-found response: `404 Not Found`**

```json
{
  "message": "No note found"
}
```

**Example**

```bash
curl -X DELETE http://localhost:4002/api/v1/notesapp/delete-note/665c7f1d8f1d8f1d8f1d8f1d
```

## 7. Error Handling

The controllers catch database and other unexpected errors and return:

```json
{
  "message": "<error message>"
}
```

with status `500 Internal Server Error`.

The current endpoint-specific statuses are:

| Status | Meaning |
|---:|---|
| `200` | Read, update, or delete completed successfully |
| `201` | Note created successfully |
| `400` | Required create fields are missing |
| `404` | Requested note does not exist |
| `500` | Unexpected server or database error |

Invalid MongoDB IDs may be handled as server errors by the current controller implementation because there is no explicit ID validation layer.

## 8. Controller Responsibilities

- `createNotes`: validates `title` and `content`, creates a `Note`, saves it, and returns it.
- `getNotes`: retrieves all notes and sorts them by newest creation time.
- `updateNote`: finds a note by ID and updates its fields, returning the updated document.
- `deleteNote`: finds a note by ID, deletes it, and returns a confirmation message.

## 9. Development Notes

- The backend is an ES module project because `package.json` contains `"type": "module"`.
- Keep the MongoDB connection string in `.env`.
- The router is intentionally mounted under `/api/v1/notesapp`; changing this prefix changes every API URL.
- The current API has no authentication, authorization, pagination, rate limiting, or centralized validation middleware.
- Automated tests are not configured yet; `npm test` currently exits with a placeholder message.
