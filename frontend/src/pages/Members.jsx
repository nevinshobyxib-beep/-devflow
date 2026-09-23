import { useEffect, useState } from "react";
import { getProjects } from "../services/projectService";
import {
  getProjectMembers,
  addProjectMember,
  removeProjectMember,
} from "../services/memberService";
import "./Members.css";

const Members = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getProjects();

        if (result.response.ok) {
          setProjects(result.data.projects);

          if (result.data.projects.length > 0) {
            setSelectedProjectId(result.data.projects[0]._id);
          }
        }
      } catch (error) {
        console.log("Failed to fetch projects", error);
      } finally {
        setLoadingProjects(false);
      }
    };

    fetchProjects();
  }, []);

  const fetchMembers = async () => {
    if (!selectedProjectId) {
      return;
    }

    try {
      setLoadingMembers(true);

      const result = await getProjectMembers(selectedProjectId);

      if (result.response.ok) {
        setMembers(result.data.members);
      }
    } catch (error) {
      console.log("Failed to fetch members", error);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [selectedProjectId]);

  const handleAddMember = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      return;
    }

    try {
      setAdding(true);

      const result = await addProjectMember(
        selectedProjectId,
        email
      );

      if (result.response.ok) {
        setEmail("");
        fetchMembers();
      } else {
        alert(result.data.message);
      }
    } catch (error) {
      console.log("Failed to add member", error);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this member?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const result = await removeProjectMember(
        selectedProjectId,
        memberUserId
      );

      if (result.response.ok) {
        setMembers((currentMembers) =>
          currentMembers.filter(
            (member) =>
              member.userId._id !== memberUserId
          )
        );
      } else {
        alert(result.data.message);
      }
    } catch (error) {
      console.log("Failed to remove member", error);
    }
  };

  return (
    <div className="members-page">
      <div className="members-header">
        <div>
          <h1>Project Members</h1>
          <p>
            Manage the people who can work on your projects.
          </p>
        </div>
      </div>

      <div className="member-project-selector">
        <label>Select Project</label>

        {loadingProjects ? (
          <p>Loading projects...</p>
        ) : projects.length === 0 ? (
          <p>No projects available.</p>
        ) : (
          <select
            value={selectedProjectId}
            onChange={(event) =>
              setSelectedProjectId(event.target.value)
            }
          >
            {projects.map((project) => (
              <option
                key={project._id}
                value={project._id}
              >
                {project.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedProjectId && (
        <>
          <div className="add-member-card">
            <h2>Add Member</h2>

            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>User Email</label>

                <input
                  type="email"
                  placeholder="Enter user's email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                />
              </div>

              <button
                type="submit"
                className="add-member-button"
                disabled={adding}
              >
                {adding ? "Adding..." : "Add Member"}
              </button>
            </form>
          </div>

          <div className="members-section">
            <h2>Members</h2>

            {loadingMembers ? (
              <p className="members-message">
                Loading members...
              </p>
            ) : members.length === 0 ? (
              <p className="members-message">
                No members added to this project yet.
              </p>
            ) : (
              <div className="members-list">
                {members.map((member) => (
                  <div
                    className="member-card"
                    key={member.userId._id}
                  >
                    <div className="member-info">
                      <h3>{member.userId.name}</h3>

                      <p>{member.userId.email}</p>

                      <span>{member.role}</span>
                    </div>

                    <button
                      className="remove-member-button"
                      onClick={() =>
                        handleRemoveMember(
                          member.userId._id
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Members;