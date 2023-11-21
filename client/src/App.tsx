import { useContext } from "react";
import Dashboard from "./Dashboard";
import StartPage from "./StartPage";
import { AuthorizationContext } from "./contexts/AuthorizationContext";

function App() {
  const loginContext = useContext(AuthorizationContext)
  return (
    <div className="h-screen items-center justify-center bg-color-movement">
      <div className="h-screen bg-white rounded-lg m-2">
          {loginContext.isLoggedIn ? <Dashboard /> : <StartPage></StartPage>}
      </div>
    </div>
  );
}

export default App;
