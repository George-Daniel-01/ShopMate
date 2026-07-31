import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import App from "@/app/App";
import { store } from "@/app/store";
import "@/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <Provider store={store}>
    <App />
  </Provider>
);
