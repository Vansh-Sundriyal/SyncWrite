# SyncWrite — Real-Time Collaborative Document Editor

A simple Google-Docs-style app where multiple logged-in users can edit the
same document at the same time and see each other's changes instantly.

**Stack:** React (Vite) + Tiptap · Node.js + Express · MongoDB · Socket.IO · JWT + bcrypt

---

## 1. What you need installed first

- **Node.js** (v18 or newer) → https://nodejs.org
- **MongoDB Community Server** running locally → https://www.mongodb.com/try/download/community
  - After installing, make sure it's running. On most systems:
    - Windows: it usually runs automatically as a service
    - Mac (Homebrew): `brew services start mongodb-community`
    - Linux: `sudo systemctl start mongod`
  - You can check it's working by running `mongosh` in a terminal — if it connects, you're good.

---

## 2. Project structure

```
syncwrite/
  backend/    → Express API + Socket.IO server (runs on http://localhost:5000)
  frontend/   → React app (runs on http://localhost:5173)
```

---

## 3. Backend setup

Open a terminal in the `backend` folder:

```bash
cd syncwrite/backend
npm install
```

Now create your environment file:

```bash
cp .env.example .env
```

Open `.env` and check the values — the defaults already work for a normal
local MongoDB install, so you usually don't need to change anything:

```
MONGO_URI=mongodb://127.0.0.1:27017/syncwrite
JWT_SECRET=this_is_a_super_secret_key_change_me
PORT=5000
```

Start the backend server:

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

Leave this terminal running.

---

## 4. Frontend setup

Open a **second** terminal in the `frontend` folder:

```bash
cd syncwrite/frontend
npm install
npm run dev
```

You should see something like:
```
  ➜  Local:   http://localhost:5173/
```

Open that link in your browser.

---

## 5. Try it out

1. Go to **http://localhost:5173** → you'll land on the login page.
2. Click **Sign up** and create an account.
3. Click **+ New Document** to create your first document.
4. Click **Share**, and type another user's email to give them access
   (you'll need to register a second account, e.g. in an incognito window,
   to test real-time collaboration).
5. Open the same document in two different browser windows (logged in as
   two different users) — start typing in one and watch it appear in the other!

---

## 6. How it works (short version)

- **Auth:** Passwords are hashed with `bcryptjs` before being saved. On
  login, the server signs a JWT token that the frontend stores and sends
  with every request.
- **Documents:** Stored in MongoDB with an `owner` and a list of
  `collaborators`. Only people with access can open a document.
- **Real-time sync:** When you open a document, the frontend joins a
  Socket.IO "room" named after that document's ID. Every keystroke change
  is broadcast instantly to everyone else in the same room, and the full
  content is saved to MongoDB a second after you stop typing.
- **Editor:** The `Tiptap` rich-text editor powers the actual writing
  experience (bold, italic, headings, lists, quotes).

---

## 7. Common issues

- **"Could not connect to MongoDB"** → make sure MongoDB is actually
  running locally (see step 1).
- **CORS or socket errors in the browser console** → make sure the backend
  is running on port 5000 and the frontend on port 5173 (the defaults).
- **Changes not syncing between windows** → make sure both windows are
  logged in as users who have access to that document, and both are
  looking at the same document URL.
