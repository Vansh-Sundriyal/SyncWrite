import { useNavigate } from "react-router-dom";

function DocumentListItem({
  document,
  userId,
  formatDate,
  onDelete,
  onRename,
}) {
  const navigate = useNavigate();

  const isOwner = document.owner?._id === userId;

  function handleRename() {
    const newTitle = prompt("Rename document", document.title);

    if (!newTitle) return;

    if (newTitle.trim() === "") return;

    onRename(document._id, newTitle.trim());
  }

  return (
    <article
      className="document-item"
      onClick={() => navigate(`/document/${document._id}`)}
    >
      {/* Document icon */}
      <div className="document-icon document-icon-wrapper">
        <lord-icon
          src="https://cdn.lordicon.com/fikcyfpp.json"
          trigger="loop-on-hover"
          style={{
            width: "42px",
            height: "42px",
          }}
        />
      </div>

      {/* Main document information */}
      <div className="document-info">
        <h3>{document.title}</h3>

        <p className="muted">
          {isOwner ? "Owned by you" : `Shared by ${document.owner?.name}`}
        </p>

        <span className="document-date">{formatDate(document.updatedAt)}</span>
      </div>

      {/* Right side actions */}
      <div className="document-actions" onClick={(e) => e.stopPropagation()}>
        {/* Open */}
        <button
          className="icon-btn"
          title="Open"
          onClick={() => navigate(`/document/${document._id}`)}
        >
          <lord-icon
            src="https://cdn.lordicon.com/tsrgicte.json"
            trigger="hover"
            style={{
              width: "20px",
              height: "20px",
            }}
          />
        </button>

        {isOwner && (
          <>
            {/* Rename */}
            <button className="icon-btn" title="Rename" onClick={handleRename}>
              <lord-icon
                src="https://cdn.lordicon.com/exymduqj.json"
                trigger="hover"
                style={{
                  width: "20px",
                  height: "20px",
                }}
              />
            </button>

            {/* Delete */}
            <button
              className="icon-btn"
              title="Delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(document._id);
              }}
            >
              <lord-icon
                src="https://cdn.lordicon.com/jzinekkv.json"
                trigger="hover"
                style={{
                  width: "20px",
                  height: "20px",
                }}
              />
            </button>
          </>
        )}
      </div>
    </article>
  );
}

export default DocumentListItem;
