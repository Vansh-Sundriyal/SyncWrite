import Avatar from "../common/Avatar";

function DashboardHeader({ user, onLogout, onProfileClick }) {
  return (
    <header className="dashboard-header">
      <div className="header-left">
        <div className="brand">
          <lord-icon
            src="https://cdn.lordicon.com/jectmwqf.json"
            trigger="hover"
            style={{ width: "52px", height: "52px" }}
          />

          <div>
            <h2 className="brand-title">SyncWrite</h2>

            <p className="brand-subtitle">Write together. Instantly.</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="welcome">
          <p className="muted small">Welcome back</p>

          <h3>{user.name}</h3>
        </div>

        <div
          className="profile-avatar"
          onClick={onProfileClick}
          title="Profile Settings"
        >
          <Avatar name={user.name} />
        </div>

        <button className="ghost-btn logout-btn" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default DashboardHeader;
