import { useState } from "react";
import { createPortal } from "react-dom";
import api from "../../api";

function ProfileModal({ user, onClose, onUserUpdate }) {
  const [name, setName] = useState(user.name);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  async function handleUpdateName() {
    if (name.trim() === user.name) return;

    try {
      const res = await api.put("/auth/profile", {
        name: name.trim(),
      });

      onUserUpdate(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Profile updated successfully.");
    } catch (err) {
      alert(err.response?.data?.message || "Could not update profile.");
    }
  }

  async function handleChangePassword() {
    try {
      await api.put("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      alert("Password changed successfully.");

      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      alert(err.response?.data?.message || "Could not change password.");
    }
  }

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="profile-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="profile-modal-header">
          <h2>Profile Settings</h2>

          <button
            className="modal-close-btn"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <section className="profile-section">
          <h3>Display Name</h3>

          <input
            className="profile-input"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={handleUpdateName}
          >
            Update Name
          </button>
        </section>

        <section className="profile-section">
          <h3>Change Password</h3>

          <input
            className="profile-input"
            type="password"
            autoComplete="current-password"
            placeholder="Current password"
            value={currentPassword}
            onChange={(e) =>
              setCurrentPassword(e.target.value)
            }
          />

          <input
            className="profile-input"
            type="password"
            autoComplete="new-password"
            placeholder="New password"
            value={newPassword}
            onChange={(e) =>
              setNewPassword(e.target.value)
            }
          />

          <button
            className="primary-btn"
            onClick={handleChangePassword}
          >
            Change Password
          </button>
        </section>
      </div>
    </div>,
    document.body,
  );
}

export default ProfileModal;