import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", formData);
      const user = res.data.user;

      if (user.role !== "admin") {
        alert("Only admin can login here.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/admin");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Admin login failed");
    }
  };

  return (
    <div className="admin-login-classic-page">
      <div className="admin-login-classic-card">
        <div className="admin-login-badge">Admin Access</div>

        <h1>Admin Login</h1>

        <p className="admin-login-subtitle">
          Login to manage products, orders, revenue, and marketplace activity.
        </p>

        <form onSubmit={handleAdminLogin} className="admin-login-form">
          <input
            type="text"
            name="emailOrPhone"
            placeholder="Admin Email ID or Phone"
            value={formData.emailOrPhone}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>

      <style>
        {`
          .admin-login-classic-page,
          .admin-login-classic-page * {
            box-sizing: border-box;
          }

          .admin-login-classic-page {
            width: 100%;
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.72), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
          }

          .admin-login-classic-card {
            width: min(100%, 430px);
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: 34px 34px 30px;
            text-align: center;
            box-shadow: 0 10px 28px rgba(62, 39, 35, 0.18);
          }

          .admin-login-badge {
            display: inline-block;
            background: #fff1d8;
            color: #7a4f2a;
            border: 1px solid #d7b98a;
            border-radius: 30px;
            padding: 7px 15px;
            font-weight: 900;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 14px;
          }

          .admin-login-classic-card h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 44px;
            line-height: 1.1;
          }

          .admin-login-subtitle {
            width: 100%;
            max-width: 320px;
            margin: 14px auto 22px;
            color: #5d4037;
            font-weight: 800;
            line-height: 1.35;
          }

          .admin-login-form {
            width: 100%;
            max-width: 310px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .admin-login-form input,
          .admin-login-form button {
            width: 100%;
            height: 46px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 800;
          }

          .admin-login-form input {
            border: 1px solid #c8a77a;
            background: #fff8ef;
            color: #3e2723;
            padding: 0 16px;
            outline: none;
          }

          .admin-login-form input::placeholder {
            color: #6d5a4d;
          }

          .admin-login-form button {
            border: none;
            background: #7a4f2a;
            color: white;
            cursor: pointer;
            font-family: Georgia, "Times New Roman", serif;
            box-shadow: 0 5px 14px rgba(62, 39, 35, 0.18);
          }

          .admin-login-form button:hover {
            background: #5c371d;
          }

          @media (max-width: 480px) {
            .admin-login-classic-card {
              padding: 28px 20px;
              border-radius: 18px;
            }

            .admin-login-classic-card h1 {
              font-size: 38px;
            }

            .admin-login-form {
              max-width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
}

export default AdminLogin;