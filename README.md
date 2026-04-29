# LearnQuick

LearnQuick is a full-stack AI learning assistant that helps students turn study documents into useful learning tools. Users can upload PDF material, ask AI-powered questions, generate summaries, create flashcards, take quizzes, and review progress from one workspace.

## What The App Does

- Helps students study from uploaded documents instead of switching between separate tools.
- Uses AI to explain concepts, answer document-based questions, generate flashcards, and create quizzes.
- Tracks study activity through documents, flashcards, quiz results, and dashboard progress.
- Provides a responsive frontend with light/dark appearance options and WCAG-focused accessibility controls.

## Project Structure

```text
LearnQuick/
  backend/   Express, MongoDB, authentication, uploads, and AI APIs
  frontend/  React, Vite, Tailwind, protected pages, and study UI
```

## Where To Start

Read the setup guides inside each app folder:

- Backend setup and API documentation: [backend/README.md](backend/README.md)
- Frontend setup and UI documentation: [frontend/README.md](frontend/README.md)

## Quick Local Setup

1. Open the backend folder and create a real `.env` from `backend/.env.example`.
2. Install and run the backend:

```bash
cd backend
npm install
npm run dev
```

3. Open a second terminal, go to the frontend folder, and create a real `.env` from `frontend/.env.example`.
4. Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

The backend usually runs on `http://localhost:8000`, and the frontend usually runs on `http://localhost:5173`.

## Environment Files

Real `.env` files are intentionally ignored by Git because they contain secrets such as database credentials, JWT secrets, and API keys. Use the committed `.env.example` files as templates.

## Author

Farouk Oladega
