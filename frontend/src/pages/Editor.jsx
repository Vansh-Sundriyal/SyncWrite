import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import api from "../api.js";
import { createSocket } from "../socket.js";

const SAVE_DELAY = 1000; // wait 1 second after typing stops before saving

function Editor({ user }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [shareEmail, setShareEmail] = useState("");
  const [shareMessage, setShareMessage] = useState("");
  const [showShareBox, setShowShareBox] = useState(false);

  const socketRef = useRef(null);
  const saveTimeout = useRef(null);
  const isRemoteUpdate = useRef(false); // prevents echo loops when receiving updates

  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    onUpdate: ({ editor }) => {
      // Don't re-broadcast changes that just came in from another user
      if (isRemoteUpdate.current) {
        isRemoteUpdate.current = false;
        return;
      }

      const html = editor.getHTML();

      // Tell everyone else in the room right away, so it feels instant
      socketRef.current?.emit("send-changes", {
        documentId: id,
        content: html,
      });

      // But only save to the database after the user pauses typing
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

  // Load the document details (title, initial content) and set up the socket
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

    // Open the Socket.IO connection.
    socket.connect();
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });
    socket.emit("join-document", id);

    socket.on("load-document", (content) => {
      if (editor) {
        isRemoteUpdate.current = true;
        editor.commands.setContent(content || "");
      }
    });

    socket.on("receive-changes", (content) => {
      if (editor) {
        isRemoteUpdate.current = true;
        editor.commands.setContent(content);
      }
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
      await api.put(`/documents/${id}`, { title });
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
          <button className="ghost-btn" onClick={() => navigate("/")}>
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
            onClick={() => setShowShareBox(!showShareBox)}
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
            <button type="submit" className="primary-btn small">
              Invite
            </button>
          </form>
          {shareMessage && <p className="muted small">{shareMessage}</p>}
        </div>
      )}

      {editor && (
        <div className="toolbar">
          <button
            className={editor.isActive("bold") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            B
          </button>
          <button
            className={editor.isActive("italic") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            I
          </button>
          <button
            className={editor.isActive("strike") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            S
          </button>
          <span className="toolbar-divider" />
          <button
            className={editor.isActive("heading", { level: 1 }) ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 1 }).run()
            }
          >
            H1
          </button>
          <button
            className={editor.isActive("heading", { level: 2 }) ? "active" : ""}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
          >
            H2
          </button>
          <span className="toolbar-divider" />
          <button
            className={editor.isActive("bulletList") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </button>
          <button
            className={editor.isActive("orderedList") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            1. List
          </button>
          <span className="toolbar-divider" />
          <button
            className={editor.isActive("blockquote") ? "active" : ""}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
          >
            " Quote
          </button>
        </div>
      )}

      <div className="editor-wrapper">
        <EditorContent editor={editor} className="editor-content" />
      </div>
    </div>
  );
}

export default Editor;
