import { useNavigate } from "react-router-dom";

function DocumentListItem({ document, userId, formatDate, onDelete }) {
  const navigate = useNavigate();

  const isOwner = document.owner?._id === userId;

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

      {/* Actions appear on the right */}
      <div className="document-actions" onClick={(e) => e.stopPropagation()}>
        <button className="icon-btn" title="Open">
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
            <button className="icon-btn" title="Rename">
              <lord-icon
                src="https://cdn.lordicon.com/exymduqj.json"
                trigger="hover"
                style={{
                  width: "20px",
                  height: "20px",
                }}
              />
            </button>

            <button
              className="icon-btn "
              title="Delete"
              onClick={() => onDelete(document._id)}
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
