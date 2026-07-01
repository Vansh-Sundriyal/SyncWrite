import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import DashboardStats from "../components/dashboard/DashboardStats";
import DocumentListItem from "../components/dashboard/DocumentListItem";
import SearchBar from "../components/dashboard/SearchBar";
import ProfileModal from "../components/profile/ProfileModal";

function Dashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  // Keeps searching responsive without extra backend requests.
  const [searchQuery, setSearchQuery] = useState("");
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  async function loadDocuments() {
    try {
      const res = await api.get("/documents");
      setDocuments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    try {
      const res = await api.post("/documents", { title: "Untitled Document" });
      navigate(`/document/${res.data._id}`);
    } catch (err) {
      console.error(err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this document? This can't be undone.")) return;
    try {
      await api.delete(`/documents/${id}`);
      setDocuments(documents.filter((doc) => doc._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete document.");
    }
  }

  // Display last edited time.
  function formatRelativeDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const diff = now - date;

    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return "Edited just now";

    if (minutes < 60)
      return `Edited ${minutes} minute${minutes > 1 ? "s" : ""} ago`;

    const hours = Math.floor(minutes / 60);

    if (hours < 24) return `Edited ${hours} hour${hours > 1 ? "s" : ""} ago`;

    const days = Math.floor(hours / 24);

    if (days === 1) return "Edited yesterday";

    if (days < 7) return `Edited ${days} days ago`;

    return `Edited ${date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    })}`;
  }

  // Filter documents on the client for a smooth search experience.
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="dashboard">
      <div className="dashboard-shell">
        {/* Top navigation */}
        <DashboardHeader
          user={currentUser}
          onLogout={onLogout}
          onProfileClick={() => setShowProfileModal(true)}
        />

        <main className="dashboard-main">
          {/* Quick overview */}
          <DashboardStats documents={documents} userId={currentUser.id} />

          {/* Documents section */}
          <section className="documents-section">
            <div className="dashboard-toolbar">
              <div className="dashboard-toolbar-left">
                <h1>Workspace</h1>

                <p className="muted">
                  {documents.length} document
                  {documents.length !== 1 ? "s" : ""}
                </p>
              </div>

              <button className="primary-btn" onClick={handleCreate}>
                + New Document
              </button>
            </div>

            <SearchBar value={searchQuery} onChange={setSearchQuery} />

            {loading && <p className="muted">Loading your documents...</p>}

            {!loading &&
              filteredDocuments.length === 0 &&
              documents.length > 0 && (
                <div className="empty-state">
                  <lord-icon
                    src="https://cdn.lordicon.com/msoeawqm.json"
                    trigger="loop"
                    style={{
                      width: "90px",
                      height: "90px",
                    }}
                  />

                  <h3>No matching documents</h3>

                  <p className="muted">Try searching with another keyword.</p>
                </div>
              )}

            {!loading && filteredDocuments.length > 0 && (
              <div className="document-list">
                {filteredDocuments.map((doc) => (
                  <DocumentListItem
                    key={doc._id}
                    document={doc}
                    userId={currentUser.id}
                    formatDate={formatRelativeDate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
        {showProfileModal && (
          <ProfileModal
            user={currentUser}
            onClose={() => setShowProfileModal(false)}
            onUserUpdate={setCurrentUser}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;
