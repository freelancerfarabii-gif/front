import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jwtDecode from "jwt-decode"; // ✅ fixed default import

const API_BASE = "https://back-vsrx.onrender.com"; // ✅ public backend URL

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState({ username: "", email: "" });
  const [password, setPassword] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  // ================= LOAD PROFILE =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    try {
      jwtDecode(token); // Validate token
    } catch {
      localStorage.removeItem("token");
      return navigate("/login");
    }

    axios
      .get(`${API_BASE}/api/auth/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser({ username: res.data.username, email: res.data.email });
        if (res.data.profilePic) {
          // preview URL fix
          const url = res.data.profilePic.startsWith("http")
            ? res.data.profilePic
            : `${API_BASE}${res.data.profilePic}`;
          setPreview(url);
        }
      })
      .catch(() => navigate("/login"));
  }, [navigate]);

  // ================= IMAGE PREVIEW =================
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setProfilePic(file);
    setPreview(URL.createObjectURL(file));
  };

  // ================= UPDATE PROFILE =================
  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/login");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("username", user.username);
      formData.append("email", user.email);
      if (password) formData.append("password", password);
      if (profilePic) formData.append("profilePic", profilePic);

      const res = await axios.put(`${API_BASE}/api/auth/update-profile`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      alert(res.data.msg);

      if (res.data.user?.profilePic) {
        const url = res.data.user.profilePic.startsWith("http")
          ? res.data.user.profilePic
          : `${API_BASE}${res.data.user.profilePic}`;
        setPreview(url);
      }
      setPassword("");
      setProfilePic(null);
    } catch (err) {
      alert(err.response?.data?.msg || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGOUT =================
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div
      style={{
        maxWidth: "450px",
        margin: "60px auto",
        padding: "30px",
        borderRadius: "12px",
        backgroundColor: "#fff",
        boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
        textAlign: "center",
      }}
    >
      <h2>My Profile</h2>

      {/* PROFILE PICTURE */}
      {preview ? (
        <img
          src={preview}
          alt="Profile"
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            objectFit: "cover",
            marginBottom: 12,
          }}
        />
      ) : (
        <div
          style={{
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "#ccc",
            display: "inline-block",
            marginBottom: 12,
          }}
        />
      )}

      <input type="file" onChange={handleFileChange} style={{ marginBottom: 12 }} />
      <input
        style={inputStyle}
        value={user.username}
        onChange={(e) => setUser({ ...user, username: e.target.value })}
        placeholder="Username"
      />
      <input
        style={inputStyle}
        value={user.email}
        onChange={(e) => setUser({ ...user, email: e.target.value })}
        placeholder="Email"
      />
      <input
        style={inputStyle}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="New Password (optional)"
      />

      <button
        onClick={handleUpdate}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          marginBottom: "12px",
        }}
      >
        {loading ? "Updating..." : "Update Profile"}
      </button>

      <button
        onClick={logout}
        style={{
          width: "100%",
          padding: "12px",
          backgroundColor: "#ff4d4f",
          color: "#fff",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </div>
  );
}