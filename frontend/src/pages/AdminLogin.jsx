import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";


function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginAdmin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const user = res.data.user;

      if (user.role !== "admin") {
        alert("Access denied. This login is only for admin.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/admin");
    } catch (error) {
      alert(error.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <>
      

      <div
        style={{
          padding: "40px",
          background: "#faf6ef",
          minHeight: "100vh",
        }}
      >
        <h1>Admin Login</h1>

        <p style={{ color: "#5d4037" }}>
          Restricted access for Artisan's Corner administrator only.
        </p>

        <form
          onSubmit={loginAdmin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            maxWidth: "350px",
            marginTop: "25px",
          }}
        >
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login as Admin</button>
        </form>
      </div>
    </>
  );
}

export default AdminLogin;