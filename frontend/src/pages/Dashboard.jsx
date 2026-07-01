import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api.js";

function Dashboard({ user, onLogout }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
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

  function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="brand">
          <span className="brand-mark">S</span>
          <span className="brand-name">SyncWrite</span>
        </div>
        <div className="header-right">
          <span className="user-greeting">Hi, {user.name.split(" ")[0]}</span>
          <button className="ghost-btn" onClick={onLogout}>
            Log out
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-toolbar">
          <h1>Your Documents</h1>
          <button className="primary-btn" onClick={handleCreate}>
            + New Document
          </button>
        </div>

        {loading && <p className="muted">Loading your documents...</p>}

        {!loading && documents.length === 0 && (
          <div className="empty-state">
            <p>You don't have any documents yet.</p>
            <p className="muted">Create your first document to start writing.</p>
          </div>
        )}

        <div className="document-grid">
          {documents.map((doc) => (
            <div key={doc._id} className="document-card" onClick={() => navigate(`/document/${doc._id}`)}>
              <div className="document-card-icon">📄</div>
              <h3>{doc.title}</h3>
              <p className="muted small">
                {doc.owner?._id === user.id ? "Owned by you" : `Shared by ${doc.owner?.name}`}
              </p>
              <p className="muted small">Updated {formatDate(doc.updatedAt)}</p>

              {doc.owner?._id === user.id && (
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(doc._id);
                  }}
                  title="Delete document"
                >
                  🗑
                </button>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
