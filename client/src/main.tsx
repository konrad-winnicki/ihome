import ReactDOM from "react-dom/client";

import "./index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import { StrictMode } from "react";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/api/login" element={<App />} />
  </Routes>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <AppRoutes />
    </Router>
  </StrictMode>
);
