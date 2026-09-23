import { useEffect, useState } from "react";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
} from "../services/projectService";
import "./Projects.css";

const Projects = () => {
  const [projects, setProjects] = useState([]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [editingProjectId, setEditingProjectId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchProjects = async () => {
    try {
      const result = await getProjects();

      if (result.response.ok) {
        setProjects(result.data.projects);
      }
    } catch (error) {
      console.log("Failed to fetch projects", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setCreating(true);

      if (editingProjectId) {
        const result = await updateProject(editingProjectId, {
          name,
          description,
        });

        if (result.response.ok) {
          setProjects((currentProjects) =>
            currentProjects.map((project) =>
              project._id === editingProjectId
                ? result.data.project
                : project
            )
          );

          setName("");
          setDescription("");
          setEditingProjectId(null);
        }
      } else {
        const result = await createProject({
          name,
          description,
        });

        if (result.response.ok) {
          setProjects((currentProjects) => [
            ...currentProjects,
            result.data.project,
          ]);

          setName("");
          setDescription("");
        }
      }
    } catch (error) {
      console.log("Failed to save project", error);
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (project) => {
    setName(project.name);
    setDescription(project.description || "");
    setEditingProjectId(project._id);
  };

  const handleDelete = async (projectId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await deleteProject(projectId);

      if (result.response.ok) {
        setProjects((currentProjects) =>
          currentProjects.filter(
            (project) => project._id !== projectId
          )
        );
      }
    } catch (error) {
      console.log("Failed to delete project", error);
    }
  };

  const handleCancelEdit = () => {
    setName("");
    setDescription("");
    setEditingProjectId(null);
  };

  return (
    <div className="projects-page">
      <div className="projects-header">
        <div>
          <h1>Projects</h1>
          <p>Manage your projects and keep your work organized.</p>
        </div>
      </div>

      <div className="create-project-card">
        <h2>
          {editingProjectId ? "Edit Project" : "Create Project"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>

            <input
              type="text"
              placeholder="Enter project name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Description</label>

            <textarea
              placeholder="Enter project description"
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
            />
          </div>

          <div className="form-buttons">
            <button
              type="submit"
              className="create-button"
              disabled={creating}
            >
              {creating
                ? "Saving..."
                : editingProjectId
                ? "Update Project"
                : "Create Project"}
            </button>

            {editingProjectId && (
              <button
                type="button"
                className="cancel-button"
                onClick={handleCancelEdit}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="projects-section">
        <h2>Your Projects</h2>

        {loading ? (
          <p className="projects-message">Loading projects...</p>
        ) : projects.length === 0 ? (
          <p className="projects-message">
            You don't have any projects yet.
          </p>
        ) : (
          <div className="projects-grid">
            {projects.map((project) => (
              <div className="project-card" key={project._id}>
                <h3>{project.name}</h3>

                <p>
                  {project.description ||
                    "No description provided."}
                </p>

                <div className="project-actions">
                  <button
                    className="edit-button"
                    onClick={() => handleEdit(project)}
                  >
                    Edit
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => handleDelete(project._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;