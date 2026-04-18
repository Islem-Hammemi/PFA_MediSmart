import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { logout } from "./services/authService";

const originalFetch = window.fetch.bind(window);
window.fetch = async (input, init) => {
  try {
    const response = await originalFetch(input, init);

    if (response.status === 401) {
      logout();
      window.location.replace("/login");
    }

    return response;
  } catch (error) {
    return Promise.reject(error);
  }
};

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);