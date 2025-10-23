import React, { useEffect, useState } from "react";

const API_BASE = "https://jc-biometric-backend.onrender.com";
 // change if your backend port differs

export default function AdminPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [idInput, setIdInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (token) loadLogs();
  }, [token]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/logs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setRows(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!idInput) return alert("Enter ID");
    try {
      const res = await fetch(`${API_BASE}/api/map`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: Number(idInput), name: nameInput }),
      });
      if (res.ok) {
        setIdInput("");
        setNameInput("");
        await loadLogs();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (mongoId) => {
    if (!window.confirm("Delete this log entry?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/logs/${mongoId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        alert("Deleted successfully!");
        await loadLogs();
      } else {
        alert("Delete failed");
      }
    } catch (e) {
      console.error(e);
      alert("Error deleting log");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        setUsername("");
        setPassword("");
      } else {
        alert("Invalid credentials");
      }
    } catch (e) {
      console.error(e);
    }
  };

  /* ---------- LOGIN SCREEN ---------- */
  if (!token) {
    return (
      <div style={styles.loginPage}>
        <div style={styles.loginCard}>
          <h2 style={{ marginBottom: 10 }}>Admin Login</h2>
          <form onSubmit={handleLogin} style={styles.loginForm}>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.inputFull}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={styles.inputFull}
              required
            />
            <button type="submit" style={styles.loginBtn}>
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  /* ---------- MAIN DASHBOARD ---------- */
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1>Fingerprint Logs</h1>
        <button style={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div style={styles.card}>
        <input
          placeholder="ID"
          value={idInput}
          onChange={(e) => setIdInput(e.target.value)}
          style={styles.inputSmall}
        />
        <input
          placeholder="Name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          style={styles.inputSmall}
        />
        <button style={styles.btn} onClick={handleSave}>
          Save
        </button>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>ID</th>
              <th>Name</th>
              <th>Date</th>
              <th>Time</th>
              <th>Direction</th>
              <th>Lab</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" style={styles.cellCenter}>
                  Loading…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan="8" style={styles.cellCenter}>
                  No records found
                </td>
              </tr>
            ) : (
              rows.map((r, idx) => (
                <tr key={idx}>
                  <td style={styles.cellCenter}>{r.index}</td>
                  <td style={styles.cellCenter}>{r.userId}</td>
                  <td style={styles.cellLeft}>{r.name}</td>
                  <td style={styles.cellCenter}>{r.date}</td>
                  <td style={styles.cellCenter}>{r.time}</td>
                  <td style={styles.cellCenter}>{r.direction}</td>
                  <td style={styles.cellCenter}>{r.lab}</td>
                  <td style={styles.cellCenter}>
                    <button
                      style={styles.deleteBtn}
                      onClick={() => handleDelete(r._id || r.id)}
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------- STYLES ---------- */
const styles = {
  /* Login screen */
  loginPage: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#0f172a",
    fontFamily: "Inter, system-ui, sans-serif",
    color: "#fff",
  },
  loginCard: {
    background: "#111827",
    padding: "40px 30px",
    borderRadius: 12,
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    width: "300px",
    textAlign: "center",
  },
  loginForm: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  inputFull: {
    background: "#1e293b",
    color: "#e5e7eb",
    border: "1px solid #334155",
    borderRadius: 6,
    padding: "10px 12px",
    fontSize: "15px",
  },
  loginBtn: {
    background: "#06b6d4",
    color: "#000",
    border: "none",
    borderRadius: 6,
    padding: "10px",
    cursor: "pointer",
    fontWeight: 600,
  },

  /* Dashboard */
  page: {
    background: "#0f172a",
    color: "#e5e7eb",
    minHeight: "100vh",
    padding: 24,
    fontFamily: "Inter, system-ui, sans-serif",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  logoutBtn: {
    background: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "8px 12px",
    cursor: "pointer",
  },
  card: {
    background: "#111827",
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  inputSmall: {
    background: "#1e293b",
    color: "#e5e7eb",
    border: "1px solid #334155",
    borderRadius: 6,
    padding: "8px 10px",
    width: "140px",
  },
  btn: {
    background: "#06b6d4",
    color: "#000",
    border: "none",
    borderRadius: 8,
    padding: "8px 14px",
    cursor: "pointer",
    fontWeight: 600,
  },

  /* Table Grid View */
  tableContainer: {
    background: "#111827",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #1f2937",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "center",
  },
  cellCenter: {
    padding: "10px 8px",
    borderBottom: "1px solid #1f2937",
    textAlign: "center",
  },
  cellLeft: {
    padding: "10px 8px",
    borderBottom: "1px solid #1f2937",
    textAlign: "left",
  },
  deleteBtn: {
    background: "#dc2626",
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "5px 10px",
    cursor: "pointer",
    fontWeight: 600,
  },
};
