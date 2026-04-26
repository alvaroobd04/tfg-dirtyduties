# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DirtyDuties** is a household task management web app (TFG - Final Year Project). Users create shared "houses", define chores with difficulty (1-5) and frequency (1-7 days), and the system auto-assigns tasks monthly using load-balancing. Task completion is verified via AI image analysis (Gemini API).

## Development Commands

### Backend (Node.js/Express — runs on port 3000)
```bash
cd Backend
npm run dev     # nodemon hot-reload
npm start       # production
```

### Frontend (Vue 3/Vite — runs on port 5173)
```bash
cd FrontEnd
npm run dev
npm run build
npm run preview
```

No test suite exists in this project.

## Environment Setup

Backend requires a `.env` file in `Backend/`:
```
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PORT=3307
DB_PASSWORD=
DB_NAME=dirtyduties_db
JWT_SECRET=...
JWT_REFRESH_TOKEN=...
SALT_ROUNDS=10
GEMINI_API_KEY=...
```

Database: MySQL 8.4.2. Import `Base de Datos/dirtyduties-db.sql` to create the schema. No seed data is provided.

The frontend hardcodes the API base URL as `http://localhost:3000` in `FrontEnd/src/services/api.js`.

## Backend Architecture

**Entry:** `Backend/src/server.js` → `Backend/src/app.js`

Uses ES modules (`"type": "module"`) throughout.

### Module pattern (auth, houses, tasks, invitations)
Each feature module under `src/modules/<feature>/` follows:
- `*.routes.js` — Express router, applies middlewares
- `*.controller.js` — Extracts req data, calls service, sends response
- `*.service.js` — Business logic
- `*.repository.js` — All SQL queries (mysql2 promise pool)
- `*.schema.js` — Zod validation schemas

### Key middleware
- `src/middlewares/auth.middlewares.js` — Extracts Bearer JWT, attaches `req.user`
- `src/middlewares/checkHouseAccess.middleware.js` — Verifies user belongs to house (checks `house_users` table)
- `src/middlewares/upload.middleware.js` — Multer for task completion images
- `src/middlewares/erorr.middleware.js` — Global error handler; formats Zod errors into 400 responses

### Custom error classes (`src/erorrs/authError.js`)
Throw these from services: `ValidationError` (400), `AuthError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `InternalServerError` (500).

### Authentication flow
- Access tokens: 15-minute JWTs in `Authorization: Bearer` header
- Refresh tokens: 7-day, stored hashed in `refresh_tokens` table
- Logout invalidates all refresh tokens for the user
- Frontend auto-refreshes on 401 via Axios response interceptor

### Task scheduling logic (`src/modules/tasks/task.service.js`)
`plantMonth()` distributes task executions across the month using a load-balancing algorithm that weights assignments by task difficulty. Called by a `node-cron` job at month start.

### AI validation (`src/modules/tasks/ai.validation.service.js`)
When a user submits a task completion image, it's sent to the Gemini 2.5 Flash API with the task name to verify the photo actually shows the completed chore.

## Frontend Architecture

**Entry:** `FrontEnd/src/main.js` — creates Vue app, initializes auth store, mounts to `#app`

### State management
- **Auth:** `src/composables/useAuth.js` (Pinia store) — `user`, `accessToken`, `isReady`; token persisted in `localStorage`; `init()` runs on app start to restore session
- **Houses/Tasks:** `src/stores/houseStore.js` — `houses`, `currentHouse`, `tasks`, `calendar`

### Composables
- `useAuth.js` — auth store wrapper
- `useHouses.js` — house list + selection
- `useTasks.js` — tasks and calendar for current house
- `useInvitations.js` — invitation generation/joining

### API layer (`src/services/api.js`)
Axios instance with:
- Request interceptor: injects `Authorization: Bearer <token>`
- Response interceptor: on 401, calls `/auth/refresh`, retries original request; on logout failure, redirects to `/login`
- Skips `Content-Type` header override when body is `FormData` (for image uploads)

### Routing (`src/router/index.js`)
| Path | View | Purpose |
|------|------|---------|
| `/` | LandingView | Marketing/home |
| `/login` | LoginView | Auth |
| `/register` | RegisterView | Auth |
| `/formulario` | FormularioView | House and task CRUD |
| `/principal` | PrincipalView | Dashboard: calendar + task list |
| `/join/:token` | JoinView | Accept house invitation |
| `/profile` | ProfileView | User settings |

## Database Schema (key relationships)

```
usuarios ──< house_users >── casa
                               │
                             tarea
                               │
                           ejecucion ──> usuarios (assigned user)

casa ──> invitacion (time-limited tokens)
usuarios ──< refresh_tokens
```

`ejecucion` is the core entity: each row is one instance of a task (`tarea`) assigned to a user on a specific date, with status `pendiente` or `completada`.

## CORS & Ports

Backend CORS is restricted to `http://localhost:5173` only. Both servers must run locally for the app to function.
