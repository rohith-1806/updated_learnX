import React, { useEffect, useState } from "react";
import API from "../../services/eventApi";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const token = localStorage.getItem("adminToken");

  const [users, setUsers] = useState([]);
  const [showCreateUser, setShowCreateUser] = useState(false);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [deleteName, setDeleteName] = useState("");
  const [deleteEmail, setDeleteEmail] = useState("");

  const [showTerminal, setShowTerminal] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState([]);

  const addLog = (message) => {
    setTerminalLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  useEffect(() => {
    if (!token) {
      window.location.href = "/admin-login";
      return;
    }
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      
      const usersData = Array.isArray(res.data)
        ? res.data
        : res.data.users || res.data.data || [];
  
      setUsers(usersData);
      addLog("Successfully connected to User Database.");
    } catch (error) {
      console.error(error);
      addLog("ERROR: Failed to fetch users from database.");
    }
  };

  const deleteUser = (id) => {
    setUsers((prev) => prev.filter((user) => user._id !== id));
    alert("User removed from dashboard (Frontend only)");
  };

  const deleteByName = () => {
    const matchedUser = users.find(
      (user) => user.name && user.name.toLowerCase().includes(deleteName.trim().toLowerCase())
    );
    if (!matchedUser) {
      alert("User Not Found in the list.");
      return;
    }
    setUsers((prev) => prev.filter((user) => user._id !== matchedUser._id));
    alert(`User ${matchedUser.name} removed from dashboard`);
    setDeleteName("");
  };

  const deleteByEmail = () => {
    const matchedUser = users.find(
      (user) => user.email && user.email.toLowerCase() === deleteEmail.trim().toLowerCase()
    );
    if (!matchedUser) {
      alert("Email Not Found in the list.");
      return;
    }
    setUsers((prev) => prev.filter((user) => user._id !== matchedUser._id));
    alert(`User ${matchedUser.email} removed from dashboard`);
    setDeleteEmail("");
  };

  const logoutAdmin = () => {
    localStorage.clear();
    window.location.href = "/admin-login";
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await API.post("/admin/create-user", { name, email });
      
      addLog("USER CREATED SUCCESSFULLY");
      addLog(`NAME: ${name} | EMAIL: ${email}`);
      addLog("Temporary password sent to user email");
      addLog("--------------------------------");
      
      alert("User Created Successfully");
      setName("");
      setEmail("");
      setShowCreateUser(false);
      
      fetchUsers();
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.error || "User Creation Failed";
      addLog(`ERROR: ${errorMsg}`);
      alert(errorMsg);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="brand-icon">🛡️</span>
          <h2>Admin Console</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button
            className="sidebar-link active"
            onClick={() => {
              setShowCreateUser(false);
              document.getElementById("users-section")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
             Overview & Users
          </button>
          
          <button className="sidebar-link primary-action" onClick={() => setShowCreateUser(true)}>
            <span>+</span> Create User
          </button>
          
          <button className="sidebar-link" onClick={() => window.open("/events", "_blank")}>
            Live Events
          </button>
          
          <button className={`sidebar-link ${showTerminal ? 'terminal-active' : ''}`} onClick={() => setShowTerminal(!showTerminal)}>
             System Logs
          </button>
        </nav>

        <button className="logout-btn" onClick={logoutAdmin}>
           Sign Out
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">
        <header className="header-container">
          <div className="header-titles">
            <h1>Administrative Management</h1>
            <p className="header-subtitle">Configure real-time server instances, monitor system configurations, and manage application nodes.</p>
          </div>
          <button className="wipe-all-btn" onClick={() => {
              if(window.confirm("Are you absolutely sure you want to clear all users from the current view?")) {
                  setUsers([]);
              }
          }}>
            Wipe Local View
          </button>
        </header>

        {/* SYSTEM LOGS TERMINAL */}
        {showTerminal && (
          <div className="terminal-view">
            <div className="terminal-header">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
              <span className="terminal-title">system_logs.sh</span>
            </div>
            <div className="terminal-box">
              {terminalLogs.length > 0 ? (
                terminalLogs.map((log, i) => <p key={i} className="terminal-line">{log}</p>)
              ) : (
                <p className="terminal-placeholder">⚡ Idle. Waiting for system events...</p>
              )}
            </div>
          </div>
        )}

        {/* QUICK MANAGEMENT TOOLS */}
        <section className="admin-tools-container">
          <div className="admin-tool-card">
            <div className="tool-card-header">
              <h3>Target System Deletion</h3>
              <p>Purge specific record structures via unique username credentials.</p>
            </div>
            <div className="tool-input-group">
              <input
                type="text"
                placeholder="Enter exact full name"
                value={deleteName}
                onChange={(e) => setDeleteName(e.target.value)}
              />
              <button onClick={deleteByName} className="tool-btn-danger">Delete Account</button>
            </div>
          </div>

          <div className="admin-tool-card">
            <div className="tool-card-header">
              <h3>Target Network Deletion</h3>
              <p>Purge registered structural nodes using designated email channels.</p>
            </div>
            <div className="tool-input-group">
              <input
                type="email"
                placeholder="name@company.com"
                value={deleteEmail}
                onChange={(e) => setDeleteEmail(e.target.value)}
              />
              <button onClick={deleteByEmail} className="tool-btn-danger">Delete Account</button>
            </div>
          </div>
        </section>

        {/* USER CARDS DISPLAY BLOCK */}
        <section className="users-section-wrapper">
          <div className="section-header">
            <h2>System Accounts</h2>
            <span className="counter-badge">{users.length} Active Nodes</span>
          </div>

          <div className="cards-grid" id="users-section">
            {users.length > 0 ? (
              users.map((item, index) => (
                <div className="user-card" key={item._id || index}>
                  <div className="user-card-top">
                    <div className="avatar-container">
                      <div className="profile-avatar">👤</div>
                      <div>
                        <h3 className="user-card-name">{item.name || item.studentName || "Anonymous Node"}</h3>
                        <span className="user-card-id">ID: {item._id ? item._id.slice(-8) : "N/A"}</span>
                      </div>
                    </div>
                    <span className={`status-badge ${item.isVerified ? "verified" : "pending"}`}>
                      {item.isVerified ? "Verified" : "Pending"}
                    </span>
                  </div>
                  
                  <div className="user-card-body">
                    <div className="info-row">
                      <span className="info-label">Network Route</span>
                      <span className="info-value email-value">{item.email}</span>
                    </div>
                  </div>

                  <div className="user-card-footer">
                    <button className="card-delete-btn" onClick={() => deleteUser(item._id)}>
                      Terminate Registry Account
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📁</div>
                <h3>No Account Structures Discovered</h3>
                <p>The system index currently contains no active profiles. Create a new user structure to initialize data fields.</p>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* CREATE USER POPUP MODAL */}
      {showCreateUser && (
        <div className="popup-overlay">
          <div className="create-user-popup">
            <button className="popup-close" onClick={() => setShowCreateUser(false)}>🗙</button>
            <div className="popup-header">
              <h2 className="popup-title">Deploy User Node</h2>
              <p className="popup-subtitle">Provision an automated user credential architecture inside live operational clusters.</p>
            </div>
            
            <form onSubmit={createUser} className="popup-form">
              <div className="input-group">
                <label>Structural Identity Name</label>
                <input
                  type="text"
                  placeholder="e.g. Alexander Wright"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              
              <div className="input-group">
                <label>Target Domain Communication Endpoint</label>
                <input
                  type="email"
                  placeholder="e.g. alex@enterprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              
              <button type="submit" className="create-btn">Execute Deployment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;