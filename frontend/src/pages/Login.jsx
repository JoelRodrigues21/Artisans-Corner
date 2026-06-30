import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", formData);
      const user = res.data.user;

      localStorage.setItem("token", res.data.token);

      if (user.role === "admin") {
        localStorage.setItem("user", JSON.stringify(user));
        navigate("/admin");
        return;
      }

      const buyerModeUser = {
        ...user,
        originalRole: user.role,
        role: "buyer",
      };

      localStorage.setItem("user", JSON.stringify(buyerModeUser));

      navigate("/buyer");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login-page-clean">
      <div className="login-card-clean">
        <h1>Login</h1>

        <p className="login-subtitle-clean">
          Login to continue shopping handmade treasures.
        </p>

        <form onSubmit={handleLogin} className="login-form-clean">
          <input
            type="email"
            name="email"
            placeholder="Email ID"
            value={formData.email}
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

        <p className="login-register-clean">
          New user? <Link to="/register">Register here</Link>
        </p>
      </div>

      <style>
        {`
          .login-page-clean,
          .login-page-clean * {
            box-sizing: border-box;
          }

          .login-page-clean {
            width: 100%;
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.75), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
          }

          .login-card-clean {
            width: min(100%, 430px);
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: 34px 34px 30px;
            text-align: center;
            box-shadow: 0 10px 28px rgba(62, 39, 35, 0.18);
          }

          .login-card-clean h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 46px;
            line-height: 1.1;
          }

          .login-subtitle-clean {
            width: 100%;
            max-width: 310px;
            margin: 14px auto 22px;
            color: #5d4037;
            font-weight: 800;
            line-height: 1.35;
          }

          .login-form-clean {
            width: 100%;
            max-width: 310px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .login-form-clean input,
          .login-form-clean button {
            width: 100%;
            height: 46px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 800;
          }

          .login-form-clean input {
            border: 1px solid #c8a77a;
            background: #fff8ef;
            color: #3e2723;
            padding: 0 16px;
            outline: none;
          }

          .login-form-clean input::placeholder {
            color: #6d5a4d;
          }

          .login-form-clean button {
            border: none;
            background: #7a4f2a;
            color: white;
            cursor: pointer;
            font-family: Georgia, "Times New Roman", serif;
            box-shadow: 0 5px 14px rgba(62, 39, 35, 0.18);
          }

          .login-form-clean button:hover {
            background: #5c371d;
          }

          .login-register-clean {
            margin: 18px 0 0;
            color: #3e2723;
            font-weight: 800;
          }

          .login-register-clean a {
            color: #7a4f2a;
            font-weight: 900;
            text-decoration: none;
          }

          .login-register-clean a:hover {
            text-decoration: underline;
          }

          @media (max-width: 480px) {
            .login-card-clean {
              padding: 28px 20px;
              border-radius: 18px;
            }

            .login-card-clean h1 {
              font-size: 40px;
            }

            .login-form-clean {
              max-width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Login;