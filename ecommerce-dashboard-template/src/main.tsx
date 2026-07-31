import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "@/app/App";
import { store } from "@/app/store";
import "@/index.css";

// Apply the saved theme before first paint to avoid a flash of the wrong theme.
try {
  if (localStorage.getItem("dashboard-theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
} catch {
  /* localStorage unavailable */
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
