import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";


function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    gender: "",
    password: "",
    role: "buyer",
  });

  const registerUser = async (e) => {
    e.preventDefault();

    try {
      await API.post("/auth/register", formData);

      alert("Registration successful. Please login.");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
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
        <h1>Register</h1>

        <form
          onSubmit={registerUser}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            maxWidth: "380px",
          }}
        >
          <select
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            style={inputStyle}
            required
          >
            <option value="buyer">Register as Buyer</option>
            <option value="vendor">Register as Vendor</option>
          </select>

          <input
            style={inputStyle}
            type="text"
            placeholder="Full Name"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />

          <input
            style={inputStyle}
            type="email"
            placeholder="Email ID"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />

          <input
            style={inputStyle}
            type="text"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
            required
          />

          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
            style={inputStyle}
            required
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          <input
            style={inputStyle}
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            required
          />

          <button type="submit">Register</button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </div>
    </>
  );
}

export default Register;