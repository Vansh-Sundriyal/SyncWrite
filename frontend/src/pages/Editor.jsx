import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import api from "../api";
import { createSocket } from "../socket";

const SAVE_DELAY = 1000;

function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [showShareBox, setShowShareBox] = useState(false);

  const socketRef = useRef(null);
  const saveTimeout = useRef(null);
  const isRemoteUpdate = useRef(false);

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",

    onUpdate: ({ editor }) => {
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }

      const html = editor.getHTML();

      socketRef.current?.emit("send-changes", {
        documentId: id,
        content: html,
      });

      setSaveStatus("Saving...");

      clearTimeout(saveTimeout.current);

      saveTimeout.current = setTimeout(() => {
        socketRef.current?.emit("save-document", {
          documentId: id,
          content: html,
        });

        setSaveStatus("Saved");
      }, SAVE_DELAY);
    },
  });

  useEffect(() => {
    let active = true;

    async function loadDocument() {
      try {
        const res = await api.get(`/documents/${id}`);

        if (!active) return;

        setTitle(res.data.title);
      } catch (err) {
        alert(err.response?.data?.message || "Could not load this document.");
        navigate("/");
      }
    }

    loadDocument();

    const socket = createSocket();
    socketRef.current = socket;

    socket.connect();

    socket.emit("join-document", id);

    socket.on("load-document", (content) => {
      if (!editor) return;

      isRemoteUpdate.current = true;
      editor.commands.setContent(content || "");
    });

    socket.on("receive-changes", (content) => {
      if (!editor) return;

      isRemoteUpdate.current = true;
      editor.commands.setContent(content);
    });

    return () => {
      active = false;

      socket.disconnect();

      clearTimeout(saveTimeout.current);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, editor]);

  async function handleTitleBlur() {
    try {
      await api.put(`/documents/${id}`, {
        title,
      });
    } catch (err) {
      console.error(err);
    }
  }

  async function handleShare(e) {
    e.preventDefault();

    setShareMessage("");

    try {
      const res = await api.post(`/documents/${id}/share`, {
        email: shareEmail,
      });

      setShareMessage(res.data.message);
      setShareEmail("");
    } catch (err) {
      setShareMessage(
        err.response?.data?.message || "Could not share document.",
      );
    }
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="editor-left">
          <button
            className="ghost-btn"
            onClick={() => navigate("/")}
          >
            ← Back
          </button>

          <input
            className="title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
          />
        </div>

        <div className="editor-right">
          <span className="save-status">{saveStatus}</span>

          <button
            className="primary-btn small"
            onClick={() => setShowShareBox((prev) => !prev)}
          >
            Share
          </button>
        </div>
      </header>

      {showShareBox && (
        <div className="share-box">
          <form onSubmit={handleShare}>
            <input
              type="email"
              placeholder="Enter a collaborator's email"
              value={shareEmail}
              onChange={(e) => setShareEmail(e.target.value)}
              required
            />

            <button
              type="submit"
              className="primary-btn small"
            >
              Invite
            </button>
          </form>

          {shareMessage && (
            <p className="muted small">
              {shareMessage}
            </p>
          )}
        </div>
      )}

      {editor && (
        <div className="toolbar">
          <button
            className={editor.isActive("bold") ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleBold().run()
            }
          >
            B
          </button>

          <button
            className={editor.isActive("italic") ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleItalic().run()
            }
          >
            I
          </button>

          <button
            className={editor.isActive("strike") ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleStrike().run()
            }
          >
            S
          </button>

          <span className="toolbar-divider" />

          <button
            className={
              editor.isActive("heading", { level: 1 })
                ? "active"
                : ""
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            H1
          </button>

          <button
            className={
              editor.isActive("heading", { level: 2 })
                ? "active"
                : ""
            }
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </button>

          <span className="toolbar-divider" />

          <button
            className={editor.isActive("bulletList") ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleBulletList().run()
            }
          >
            • List
          </button>

          <button
            className={editor.isActive("orderedList") ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleOrderedList().run()
            }
          >
            1. List
          </button>

          <span className="toolbar-divider" />

          <button
            className={editor.isActive("blockquote") ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleBlockquote().run()
            }
          >
            " Quote
          </button>
        </div>
      )}

      <div className="editor-wrapper">
        <EditorContent
          editor={editor}
          className="editor-content"
        />
      </div>
    </div>
  );
}

export default Editor;