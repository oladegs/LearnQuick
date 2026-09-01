import React, { lazy, Suspense } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AppLoading from "./components/common/AppLoading";

// Each page is downloaded only when its route is visited. This keeps the
// initial login/dashboard bundle small instead of shipping the entire app.
const LoginPage = lazy(() => import("./pages/Auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/Auth/RegisterPage"));
const ForgotPasswordPage = lazy(() =>
  import("./pages/Auth/ForgotPasswordPage"),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/Auth/ResetPasswordPage"),
);
const OAuthCallbackPage = lazy(() =>
  import("./pages/Auth/OAuthCallbackPage"),
);
const DashboardPage = lazy(() => import("./pages/Auth/DashboardPage"));
const DocumentListPage = lazy(() =>
  import("./pages/Documents/DocumentListPage"),
);
const DocumentDetailPage = lazy(() =>
  import("./pages/Documents/DocumentDetailPage"),
);
const FlashcardsListPage = lazy(() =>
  import("./pages/Flashcards/FlashcardsListPage"),
);
const FlashcardPage = lazy(() => import("./pages/Flashcards/FlashcardPage"));
const QuizTakePage = lazy(() => import("./pages/Quizzes/QuizTakePage"));
const QuizResultsPage = lazy(() => import("./pages/Quizzes/QuizResultPage"));
const ProfilePage = lazy(() => import("./pages/Profile/ProfilePage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const FeedbackPage = lazy(() => import("./pages/FeedbackPage"));
const NotFoundPage = lazy(() => import("./pages/NotFoundPage"));

const App = () => {
  const { loading } = useAuth();

  if (loading) {
    return <AppLoading />;
  }

  return (
    <ErrorBoundary>
      <Router>
        <Suspense fallback={<AppLoading />}>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/auth/callback" element={<OAuthCallbackPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/documents" element={<DocumentListPage />} />
              <Route path="/documents/:id" element={<DocumentDetailPage />} />
              <Route path="/flashcards" element={<FlashcardsListPage />} />
              <Route
                path="/documents/:id/flashcards"
                element={<FlashcardPage />}
              />
              <Route path="/quizzes/:quizId" element={<QuizTakePage />} />
              <Route
                path="/quizzes/:quizId/results"
                element={<QuizResultsPage />}
              />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
