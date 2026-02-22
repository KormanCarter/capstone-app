# Capstone App

A full-stack learning app where students can sign up, enroll in classes, track progress, and request course completion.

## What this project does

This app helps students manage classes in one place.

- Create an account or log in
- Browse and search classes
- Enroll or unenroll from classes
- Request course completion
- View profile and settings
- Use light mode or dark mode

Admins can review and approve completion requests.

## Tech stack

- Front end: React + Vite + Tailwind CSS
- Back end: Node.js + Express
- Database: PostgreSQL
- Auth: Session-based auth with Passport (local + optional Google login)

## Project structure

- `client/` - React app
- `server/` - Express API and database logic
- `server/database-setup.sql` - SQL script to create tables
- `server/scripts/setup-database.js` - Script to run DB setup

## Before you start

Make sure you have:

- Node.js 18+ (or newer)
- npm
- PostgreSQL running on your machine (or a hosted DB URL)

## 1) Install dependencies

From the project root:

```bash
cd client
npm install

cd ../server
npm install
```

## 2) Set up environment variables

Create `server/.env` with values like these:

```env
PORT=3001
CLIENT_URL=http://localhost:5173
SESSION_SECRET=change-this-secret
DB_URL=postgresql://postgres:postgres@localhost:5432/postgres

# Optional Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SERVER_URL=http://localhost:3001
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback
```

Notes:

- `DB_URL` is used for PostgreSQL connection.
- Google login is optional. Local email/password login works without it.

## 3) Set up the database

From the `server` folder:

```bash
node scripts/setup-database.js
```

This runs `server/database-setup.sql` and creates required tables.

## 4) Run the app

Use two terminals.

Terminal 1 (server):

```bash
cd server
npm run dev
```

Terminal 2 (client):

```bash
cd client
npm run dev
```

Then open:

- Client: `http://localhost:5173`
- Server: `http://localhost:3001`

## Main scripts

### Client

- `npm run dev` - Start front-end dev server
- `npm run build` - Build front-end for production
- `npm run preview` - Preview production build

### Server

- `npm run dev` - Start server in watch mode
- `npm start` - Start server normally

## Common issues

- **Database connection error**: Check `DB_URL` and make sure PostgreSQL is running.
- **Session/login issues**: Check `SESSION_SECRET` and restart server.
- **CORS issue on local**: Make sure client is on `5173` and server is on `3001`.

## License

This project is for school/capstone use.
