# LearnQuick Frontend

React frontend for LearnQuick, a full-stack MERN app that turns PDFs and long-form learning material into interactive learning experiences with AI chat, summaries, flashcards, quizzes, quiz analytics, and progress tracking. It is designed for students, busy professionals, readers, researchers, and lifelong learners.

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Lucide React icons
- React Hot Toast
- React Markdown

## Features

- Audience-friendly learning workflows for school, professional development, research, and personal reading
- Secure login and registration pages
- Protected application routes
- Dashboard with progress overview and recent activity
- Document listing and upload modal
- Embedded PDF viewer in the document details page
- AI chat interface for document questions
- AI actions tab for summaries and concept explanations
- Flashcards tab with generated flashcard sets and flip-card review
- Flashcard listing page
- About page explaining what LearnQuick does
- Accessibility menu with larger text, high contrast, and reduced motion options
- Quiz tab with generated quizzes
- Quiz take page
- Quiz result page with detailed answers, explanations, and score breakdown
- Profile page
- Responsive Tailwind UI for desktop and mobile

## Accessibility

LearnQuick includes WCAG-focused accessibility support in the shared app layout:

- Keyboard-accessible sidebar, appearance, and accessibility controls
- Skip-to-content link for keyboard and screen reader users
- Visible focus indicators with strong contrast
- Semantic `main` landmark for protected app pages
- Accessible labels on icon-only header controls
- Persistent accessibility preferences in `localStorage`
- Larger text option for readability
- High contrast option for stronger foreground/background separation
- Reduced motion option, plus support for the system `prefers-reduced-motion` setting
- Dark, light, and device-default appearance modes

When adding new UI, keep these checks in mind:

- Use real buttons and links for interactive controls.
- Add `aria-label` to icon-only buttons.
- Keep heading order logical.
- Do not rely on color alone to communicate state.
- Make sure every form input has a visible label.
- Test keyboard navigation with `Tab`, `Shift + Tab`, `Enter`, `Space`, and `Escape`.
- Maintain readable color contrast in light, dark, and high contrast modes.

## Clone The Project

```bash
git clone <your-github-repository-url>
cd LearnQuick/frontend
```

If you already cloned the full project, go directly into the frontend folder:

```bash
cd frontend
```

## Install Dependencies

```bash
npm install
```

## Environment Setup

The frontend currently uses `http://localhost:8000` as the default backend API URL in `src/utils/apiPaths.js`.

Create a `.env` file in this frontend folder if you want to document or reuse the API URL:

```env
VITE_API_URL=http://localhost:8000
```

Note: most API calls currently use the hardcoded `BASE_URL` in `src/utils/apiPaths.js`. If you deploy the backend or change ports, update that value or wire `BASE_URL` to `import.meta.env.VITE_API_URL`.

## Run The Frontend

```bash
npm run dev
```

Vite will start the app, usually at:

```text
http://localhost:5173
```

## Build For Production

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Lint

```bash
npm run lint
```

## Startup Checklist

Before testing the frontend, check:

- The backend server is running on `http://localhost:8000`.
- MongoDB is connected through the backend.
- The backend `.env` includes `MONGODB_URI`, `JWT_SECRET`, and `GEMINI_API_KEY`.
- You have registered or logged in so a JWT token exists in local storage.
- Uploaded PDFs have finished processing before using AI features.
- If the PDF viewer does not load, confirm the backend `/uploads` static route is reachable.
- If AI chat, summaries, flashcards, or quizzes fail, confirm the Gemini API key is valid on the backend.

## Main Project Structure

```text
src/
  components/
    ai/
    auth/
    chat/
    common/
    flashcards/
    layout/
    quizzes/
  context/
  pages/
    Auth/
    Documents/
    Flashcards/
    Profile/
    Quizzes/
  services/
  utils/
```

## Important Routes

- `/login`
- `/register`
- `/dashboard`
- `/documents`
- `/documents/:id`
- `/flashcards`
- `/documents/:id/flashcards`
- `/quizzes/:quizId`
- `/quizzes/:quizId/results`
- `/about`
- `/profile`

## Notes

- Start the backend before using protected app features.
- The app expects JWT authentication and sends the token from `localStorage` through Axios.
- Quiz scoring is handled by the backend, while the result page also normalizes answers for accurate display.

## Author
- Farouk Oladega
