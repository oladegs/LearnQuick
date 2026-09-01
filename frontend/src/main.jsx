import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";

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
              primary: "#F97316",
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
