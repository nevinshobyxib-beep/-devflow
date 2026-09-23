
import { NavLink, useNavigate } from "react-router-dom";

import "./Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const userName = localStorage.getItem("userName") || "User";
  const firstLetter = userName.charAt(0).toUpperCase();

  const handleProfile = () => {
    navigate("/profile");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <button
          className="profile-circle"
          onClick={handleProfile}
        >
          {firstLetter}
        </button>

        <div>
          <h2>DevFlow</h2>
          <p>Project Management</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className="sidebar-link">
          Dashboard
        </NavLink>

        <NavLink to="/projects" className="sidebar-link">
          Projects
        </NavLink>

        <NavLink to="/tasks" className="sidebar-link">
          Tasks
        </NavLink>

        <NavLink to="/members" className="sidebar-link">
          Members
        </NavLink>
      </nav>

      <button
        className="sidebar-logout"
        onClick={handleLogout}
      >
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
