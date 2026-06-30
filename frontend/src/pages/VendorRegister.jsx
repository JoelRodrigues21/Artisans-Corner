import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function VendorRegister() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleVendorRegister = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", {
        ...formData,
        role: "vendor",
      });

      alert("Seller registered successfully. Please login.");
      navigate("/vendor-login");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Seller registration failed");
    }
  };

  return (
    <div className="vendor-register-page">
      <button
        type="button"
        className="vendor-register-back-btn"
        onClick={() => navigate("/vendor-login")}
      >
        ← Back
      </button>

      <div className="vendor-register-card">
        <h1>Seller Register</h1>

        <p className="vendor-register-subtitle">
          Create your seller account to sell handmade products.
        </p>

        <form onSubmit={handleVendorRegister} className="vendor-register-form">
          <input
            type="text"
            name="name"
            placeholder="Seller Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Seller Email ID"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />

          <select name="gender" value={formData.gender} onChange={handleChange}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit">Register</button>
        </form>

        <p className="vendor-register-login">
          Already have a seller account?{" "}
          <Link to="/vendor-login">Login here</Link>
        </p>
      </div>

      <style>
        {`
          .vendor-register-page,
          .vendor-register-page * {
            box-sizing: border-box;
          }

          .vendor-register-page {
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

          .vendor-register-back-btn {
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
          }

          .vendor-register-card {
            width: min(100%, 450px);
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: 34px 34px 30px;
            text-align: center;
            box-shadow: 0 10px 28px rgba(62, 39, 35, 0.18);
          }

          .vendor-register-card h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 42px;
          }

          .vendor-register-subtitle {
            width: 100%;
            max-width: 320px;
            margin: 14px auto 22px;
            color: #5d4037;
            font-weight: 800;
            line-height: 1.35;
          }

          .vendor-register-form {
            width: 100%;
            max-width: 320px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 14px;
          }

          .vendor-register-form input,
          .vendor-register-form select,
          .vendor-register-form button {
            width: 100%;
            height: 46px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 800;
          }

          .vendor-register-form input,
          .vendor-register-form select {
            border: 1px solid #c8a77a;
            background: #fff8ef;
            color: #3e2723;
            padding: 0 16px;
            outline: none;
          }

          .vendor-register-form button {
            border: none;
            background: #7a4f2a;
            color: white;
            cursor: pointer;
            font-family: Georgia, "Times New Roman", serif;
          }

          .vendor-register-login {
            margin: 18px 0 0;
            color: #3e2723;
            font-weight: 800;
          }

          .vendor-register-login a {
            color: #7a4f2a;
            font-weight: 900;
            text-decoration: none;
          }

          @media (max-width: 480px) {
            .vendor-register-page {
              align-items: flex-start;
              padding-top: 90px;
            }

            .vendor-register-card {
              padding: 28px 20px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default VendorRegister;