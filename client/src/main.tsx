import ReactDOM from "react-dom/client";

import "./styles/index.css";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { StrictMode } from "react";
import { AuthContextProvider } from "./contexts/AuthorizationContext.tsx";
import TaskList from "./taskComponents/TaskList.tsx";
import StartPage from "./StartPage.tsx";
import Dashboard from "./Dashboard.tsx";
import { ProtectedRoute } from "./ProtectedRoute.tsx";

export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<StartPage />} />
    <Route path="/login" element={<StartPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/switches/:id" element={<TaskList />} />
    </Route>
  </Routes>
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <AuthContextProvider>
        <AppRoutes />
      </AuthContextProvider>
    </Router>
  </StrictMode>
);
