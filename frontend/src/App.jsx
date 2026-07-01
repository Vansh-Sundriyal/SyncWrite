import { Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Editor from "./pages/Editor.jsx";

function App() {
  // Keep track of whether the user is logged in by checking localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  function handleLogin(userData, token) {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
      />
      <Route
        path="/register"
        element={!user ? <Register onLogin={handleLogin} /> : <Navigate to="/" />}
      />
      <Route
        path="/"
        element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
      <Route
        path="/document/:id"
        element={user ? <Editor user={user} /> : <Navigate to="/login" />}
      />
    </Routes>
  );
}

export default App;
