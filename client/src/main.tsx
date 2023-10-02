import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom'; 


export const AppRoutes = () => (
  <Routes>
    <Route path="/api/app" element={<App/>} />
    <Route path="/api/chatroom" element={<App/>} />
  </Routes>
);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <Router>
    <AppRoutes
    />
    </Router>
)
