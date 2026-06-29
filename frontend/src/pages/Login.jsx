import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";


function Login() {
  const navigate = useNavigate();

  const [loginRole, setLoginRole] = useState("buyer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginUser = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      const user = res.data.user;

      if (user.role !== loginRole) {
        alert(`This account is not registered as ${loginRole}`);
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      if (user.role === "buyer") {
        navigate("/buyer");
      } else if (user.role === "vendor") {
        navigate("/vendor");
      }
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #c8b6a6",
    width: "100%",
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
        <h1>Login</h1>

        <form
          onSubmit={loginUser}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            maxWidth: "350px",
          }}
        >
          <select
            value={loginRole}
            onChange={(e) => setLoginRole(e.target.value)}
            style={inputStyle}
          >
            <option value="buyer">Login as Buyer</option>
            <option value="vendor">Login as Vendor</option>
          </select>

          <input
            style={inputStyle}
            type="text"
            placeholder="Email ID or Phone Number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>

        <p>
          New user? <Link to="/register">Register here</Link>
        </p>
      </div>
    </>
  );
}

export default Login;