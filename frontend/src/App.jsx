import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Members from "./pages/Members";
import Profile from "./pages/Profile";

import Sidebar from "./components/Sidebar";

import "./App.css";

const AppContent = () => {
  const location = useLocation();

  const token = localStorage.getItem("token");

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register";

  if (!token && !isAuthPage) {
    return <Navigate to="/login" replace />;
  }

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    );
  }

  // User is logged in
  if (isAuthPage) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="app">
      <Sidebar />

      <main className="main-content">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />

          <Route path="/projects" element={<Projects />} />

          <Route path="/tasks" element={<Tasks />} />

          <Route path="/members" element={<Members />} />

          <Route path="/profile" element={<Profile />} />

          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </main>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;