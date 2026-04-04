import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { UIProvider } from "./context/UIContext";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./index.css";

// Keep Render backend alive (free tier sleeps after 15 min inactivity)
const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:8082";
setInterval(() => {
  fetch(`${BASE_URL}/auth/login`, { method: "OPTIONS" }).catch(() => {});
}, 10 * 60 * 1000); // every 10 minutes

const theme = createTheme({
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  primaryColor: "violet",
  defaultRadius: "md",
  colors: {
    dark: [
      '#C1C2C5', '#A6A7AB', '#909296', '#5c5f66',
      '#373A40', '#2C2E33', '#25262b', '#1A1B1E',
      '#141517', '#101113',
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
      },
    },
    Card: {
      defaultProps: {
        radius: "lg",
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Notifications position="top-right" zIndex={10000} />
      <UIProvider>
        <App />
      </UIProvider>
    </MantineProvider>
  </React.StrictMode>
);
