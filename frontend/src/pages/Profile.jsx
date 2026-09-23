import { useEffect, useState } from "react";
import apiFetch from "../services/api";
import "./Profile.css";

const Profile = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const result = await apiFetch("/auth/profile");

        if (result.response.ok) {
          setName(result.data.user.name);
          setEmail(result.data.user.email);
        }
      } catch (error) {
        console.log("Failed to fetch profile", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");

    try {
      setSaving(true);

      const result = await apiFetch("/auth/profile", {
        method: "PUT",
        body: JSON.stringify({
          name,
          email,
        }),
      });

      if (result.response.ok) {
        setName(result.data.user.name);
        setEmail(result.data.user.email);
        setMessage("Profile updated successfully");
      } else {
        setMessage(
          result.data.message || "Failed to update profile"
        );
      }
    } catch (error) {
      console.log("Failed to update profile", error);
      setMessage("Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <p className="profile-loading">
          Loading profile...
        </p>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile</h1>
        <p>Manage your account information.</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          {name.charAt(0).toUpperCase()}
        </div>

        <div className="profile-info">
          <h2>{name}</h2>
          <p>{email}</p>
        </div>

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <label>Name</label>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
            />
          </div>

          {message && (
            <p className="profile-message">
              {message}
            </p>
          )}

          <button
            type="submit"
            className="save-profile-button"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;