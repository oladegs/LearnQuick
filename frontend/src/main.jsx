import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

// Apply the persisted two-state theme before React paints to prevent a light
// flash when a user has selected dark mode.
const storedTheme = window.localStorage.getItem("learnquick-theme");
const initialTheme =
  storedTheme === "dark" || storedTheme === "light"
    ? storedTheme
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
document.documentElement.classList.toggle("dark", initialTheme === "dark");
document.documentElement.style.colorScheme = initialTheme;

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            border: "1px solid rgba(255,255,255,0.1)",
            background: "#171717",
            color: "#FAFAF9",
            borderRadius: "14px",
            boxShadow: "0 18px 50px rgba(0,0,0,0.28)",
            fontSize: "14px",
            fontWeight: 600,
          },
          success: {
            iconTheme: {
              primary: "#2563EB",
              secondary: "#FFFFFF",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF4444",
              secondary: "#FFFFFF",
            },
          },
        }}
      />
      <App />
    </AuthProvider>
  </StrictMode>,
);
