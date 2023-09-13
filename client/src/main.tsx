import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'; // Use BrowserRouter, Routes, and Route
import Register from './Register.tsx';


export const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<App />} />
    <Route path="/api" element={<App />} />
    <Route path="/api/login" element={<App />} />
    <Route path="/api/chatroom" element={<App />} />
    <Route path="/api/users" element={<Register />} />
  </Routes>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
  //<React.StrictMode>
    <Router>
    <AppRoutes
    />
    </Router>
  //</React.StrictMode>,
)
