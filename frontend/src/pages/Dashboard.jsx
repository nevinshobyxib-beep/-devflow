import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./Dashboard.css";

import { getDashboardStats } from "../services/dashboardService";
import { getProjects } from "../services/projectService";
import { getProjectActivities } from "../services/activityService";

const Dashboard = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    totalMembers: 0,
  });

  const [userName] = useState(
    localStorage.getItem("userName") || "User"
  );

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const statsResult = await getDashboardStats();

        if (statsResult.response.ok) {
          setStats(statsResult.data);
        }

        const projectsResult = await getProjects();

        if (projectsResult.response.ok) {
          const projects = projectsResult.data.projects || [];

          const activityResults = await Promise.all(
            projects.map((project) =>
              getProjectActivities(project._id)
            )
          );

          const allActivities = activityResults.flatMap(
            (result) =>
              result.response.ok
                ? result.data.activities || []
                : []
          );

          allActivities.sort(
            (a, b) =>
              new Date(b.createdAt) -
              new Date(a.createdAt)
          );

          setActivities(allActivities.slice(0, 5));
        }
      } catch (error) {
        console.log(
          "Failed to fetch dashboard data",
          error
        );
      }
    };

    fetchDashboardData();
  }, []);

  const completionPercentage =
    stats.totalTasks === 0
      ? 0
      : Math.round(
          (stats.completedTasks / stats.totalTasks) * 100
        );

  return (
    <div className="dashboard">
      <h1>
        Welcome back, {userName}
      </h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p>{stats.totalProjects}</p>
        </div>

        <div className="stat-card">
          <h3>Total Tasks</h3>
          <p>{stats.totalTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Completed Tasks</h3>
          <p>{stats.completedTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Pending Tasks</h3>
          <p>{stats.pendingTasks}</p>
        </div>

        <div className="stat-card">
          <h3>Total Members</h3>
          <p>{stats.totalMembers}</p>
        </div>
      </div>

      <div className="progress-card">
        <div className="progress-header">
          <div>
            <h3>Task Progress</h3>
            <p>Overall project completion</p>
          </div>

          <span>{completionPercentage}%</span>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{
              width: `${completionPercentage}%`,
            }}
          ></div>
        </div>

        <p className="progress-text">
          {stats.completedTasks} of {stats.totalTasks} tasks
          completed
        </p>
      </div>

      <div className="activity-card">
        <div className="activity-header">
          <div>
            <h3>Recent Activity</h3>
            <p>Latest activity across your projects</p>
          </div>
        </div>

        {activities.length === 0 ? (
          <p className="activity-empty">
            No recent activity
          </p>
        ) : (
          <div className="activity-list">
            {activities.map((activity) => (
              <div
                className="activity-item"
                key={activity._id}
              >
                <div className="activity-dot"></div>

                <div className="activity-content">
                  <p>
                    <strong>
                      {activity.userId?.name || "User"}
                    </strong>{" "}
                    {activity.description}
                  </p>

                  <span>
                    {new Date(
                      activity.createdAt
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>

        <div className="action-buttons">
          <button
            className="action-button"
            onClick={() => navigate("/projects")}
          >
            + Create Project
          </button>

          <button
            className="action-button secondary"
            onClick={() => navigate("/tasks")}
          >
            + Add Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;