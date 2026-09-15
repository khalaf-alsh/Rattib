import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./styles/theme.css";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import { AuthProvider } from "./context/AuthContext";

// Mount the application and provide routing and authentication
// context to every page and component.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
