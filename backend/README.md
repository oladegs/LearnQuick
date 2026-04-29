# LearnQuick Backend

Express and Node.js backend for LearnQuick, a full-stack MERN app that transforms PDFs into interactive study tools using MongoDB, JWT authentication, file uploads, and Google Gemini AI.

## Tech Stack

- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- Bcrypt password hashing
- Multer file uploads
- pdf-parse for PDF text extraction
- Google Gemini AI via `@google/genai`
- CORS and dotenv

## Features

- User authentication with register, login, profile, profile update, and password update APIs
- MongoDB schemas for User, Document, Flashcard, Quiz, and ChatHistory
- PDF upload, storage, text extraction, retrieval, update, and delete APIs
- Static `/uploads` route for uploaded files
- AI document chat with context-aware Gemini responses
- AI document summary generation
- AI concept explanation
- AI flashcard generation
- AI quiz generation with configurable question counts
- Flashcard APIs for listing, reviewing, favoriting, and deleting
- Quiz APIs for listing, fetching by ID, submitting, result review, and deleting
- Quiz answer normalization so correct answers are scored reliably even when AI output uses labels like `01`, `A`, or exact option text
- Dashboard overview API for documents, flashcards, quizzes, and recent activity
- Central error handling middleware

## Clone The Project

```bash
git clone <your-github-repository-url>
cd AILearningAssistant/backend
```

If you already cloned the full project, go directly into the backend folder:

```bash
cd backend
```

## Install Dependencies

```bash
npm install
```

## Environment Setup

Create a `.env` file in the backend folder:

```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<database-name>
JWT_SECRET=replace_with_a_long_secure_secret
JWT_EXPIRE=7d
GEMINI_API_KEY=your_google_gemini_api_key
MAX_FILE_SIZE=10485760
```

### Environment Variables

- `NODE_ENV`: usually `development` locally.
- `PORT`: backend port. The frontend expects `8000` by default.
- `MONGODB_URI`: MongoDB connection string.
- `JWT_SECRET`: secret used to sign authentication tokens.
- `JWT_EXPIRE`: JWT expiry period, default is `7d` in the auth controller.
- `GEMINI_API_KEY`: Google Gemini API key used for AI chat, summaries, flashcards, quizzes, and explanations.
- `MAX_FILE_SIZE`: optional upload size limit in bytes. Default is `10485760` bytes, or 10 MB.

## Run The Backend

Development mode with nodemon:

```bash
npm run dev
```

Production-style start:

```bash
npm start
```

The server should run at:

```text
http://localhost:8000
```

## Startup Checklist

When starting the backend, check the terminal for:

- `MongoDB Connected: ...`
- `Server running in development mode on port 8000`
- No `GEMINI_API_KEY is not set` error
- No MongoDB authentication or network errors
- The `uploads` folder exists or can be created/written to

If requests fail from the frontend, check:

- The frontend API base URL points to `http://localhost:8000`.
- The user is logged in and sending `Authorization: Bearer <token>`.
- The requested document belongs to the logged-in user.
- The uploaded document status is ready before calling AI routes.
- Gemini API quota/key is valid if AI routes fail.

## API Route Groups

Base URL:

```text
http://localhost:8000
```

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `PUT /api/auth/profile`
- `POST /api/auth/change-password`

### Documents

- `POST /api/documents/upload`
- `GET /api/documents`
- `GET /api/documents/:id`
- `PUT /api/documents/:id`
- `DELETE /api/documents/:id`

### AI

- `POST /api/ai/generate-flashcards`
- `POST /api/ai/generate-quiz`
- `POST /api/ai/generate-summary`
- `POST /api/ai/chat`
- `POST /api/ai/explain-concept`
- `GET /api/ai/chat-history/:documentId`

### Flashcards

- `GET /api/flashcards`
- `GET /api/flashcards/:documentId`
- `POST /api/flashcards/:cardId/review`
- `PUT /api/flashcards/:cardId/star`
- `DELETE /api/flashcards/:id`

### Quizzes

- `GET /api/quizzes/:documentId`
- `GET /api/quizzes/quiz/:id`
- `POST /api/quizzes/:id/submit`
- `GET /api/quizzes/:id/results`
- `DELETE /api/quizzes/:id`

### Progress

- `GET /api/progress/dashboard`

## Main Project Structure

```text
backend/
  config/
  controllers/
  middleware/
  models/
  routes/
  uploads/
  utils/
  server.js
```

## Development Notes

- Start MongoDB before running the backend.
- Start the backend before the frontend.
- Keep `.env` private and do not commit real secrets.
- Uploaded PDFs are served from `/uploads`.
- Gemini-powered routes require extracted document text, so document upload and parsing must complete first.

## Author
- Farouk Oladega
