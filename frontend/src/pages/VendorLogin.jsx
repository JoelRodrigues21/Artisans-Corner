import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function VendorLogin() {
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

  const handleVendorLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", formData);
      const user = res.data.user;

      if (user.role !== "vendor") {
        alert("This is Seller Login. Please login with a vendor account.");
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/vendor");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Seller login failed");
    }
  };

  return (
    <div className="seller-login-page-clean">
      <button
        type="button"
        className="seller-back-top-btn"
        onClick={() => navigate("/buyer")}
      >
        ← Back
      </button>

      <div className="seller-login-card-clean">
        <h1>Seller Login</h1>

        <p className="seller-login-subtitle-clean">
          Login to manage products, orders, stock, and earnings.
        </p>

        <form onSubmit={handleVendorLogin} className="seller-login-form-clean">
          <input
            type="email"
            name="email"
            placeholder="Seller Email ID"
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

        <p className="seller-register-clean">
          New seller? <Link to="/vendor-register">Register here</Link>
        </p>
      </div>

      <style>
        {`
          .seller-login-page-clean,
          .seller-login-page-clean * {
            box-sizing: border-box;
          }

          .seller-login-page-clean {
            width: 100%;
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.75), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 18px;
            position: relative;
          }

          .seller-back-top-btn {
            position: absolute;
            top: 24px;
            left: 24px;
            background: #3e2723;
            color: #fff8ef;
            border: 1px solid #c8a77a;
            border-radius: 30px;
            padding: 11px 22px;
            font-family: Georgia, "Times New Roman", serif;
            font-weight: 900;
            cursor: pointer;
            box-shadow: 0 5px 14px rgba(62, 39, 35, 0.2);
          }

          .seller-login-card-clean {
            width: min(100%, 430px);
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: 34px 34px 30px;
            text-align: center;
            box-shadow: 0 10px 28px rgba(62, 39, 35, 0.18);
          }

          .seller-login-card-clean h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 44px;
            line-height: 1.1;
          }

          .seller-login-subtitle-clean {
            width: 100%;
            max-width: 310px;
            margin: 14px auto 22px;
            color: #5d4037;
            font-weight: 800;
            line-height: 1.35;
          }

          .seller-login-form-clean {
            width: 100%;
            max-width: 310px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .seller-login-form-clean input,
          .seller-login-form-clean button {
            width: 100%;
            height: 46px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 800;
          }

          .seller-login-form-clean input {
            border: 1px solid #c8a77a;
            background: #fff8ef;
            color: #3e2723;
            padding: 0 16px;
            outline: none;
          }

          .seller-login-form-clean button {
            border: none;
            background: #7a4f2a;
            color: white;
            cursor: pointer;
            font-family: Georgia, "Times New Roman", serif;
          }

          .seller-register-clean {
            margin: 18px 0 0;
            color: #3e2723;
            font-weight: 800;
          }

          .seller-register-clean a {
            color: #7a4f2a;
            font-weight: 900;
            text-decoration: none;
          }

          @media (max-width: 480px) {
            .seller-login-page-clean {
              align-items: flex-start;
              padding-top: 90px;
            }

            .seller-login-card-clean {
              padding: 28px 20px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default VendorLogin;