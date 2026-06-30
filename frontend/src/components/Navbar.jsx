import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");

  let user = null;

  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    user = null;
  }

  const isHomePage = location.pathname === "/";

  const handleSearch = (e) => {
    e.preventDefault();

    const keyword = searchTerm.trim();

    if (!keyword) return;

    navigate(`/?search=${encodeURIComponent(keyword)}`);
  };

  const goToProfile = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "vendor") {
      navigate("/vendor");
      return;
    }

    if (user.role === "admin") {
      navigate("/admin");
      return;
    }

    navigate("/buyer");
  };

  return (
    <nav className="center-classic-navbar">
      <div className="center-navbar-left">
        <Link to="/" className="center-classic-logo">
          Artisan&apos;s Corner
        </Link>
      </div>

      <div className="center-navbar-middle">
        {isHomePage && (
          <form onSubmit={handleSearch} className="center-classic-search">
            <input
              type="text"
              placeholder="Search handmade treasures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            <button type="submit">Search</button>
          </form>
        )}
      </div>

      <div className="center-navbar-right">
        {user ? (
          <button
            type="button"
            className="center-profile-icon"
            onClick={goToProfile}
            title="Profile"
          >
            👤
          </button>
        ) : (
          <Link to="/login" className="center-login-link">
            Login
          </Link>
        )}
      </div>

      <style>
        {`
          .center-classic-navbar {
            width: 100%;
            min-height: 76px;
            background: #3e2723;
            border-bottom: 2px solid #c8a77a;
            padding: 14px 34px;
            display: grid;
            grid-template-columns: 1fr minmax(280px, 560px) 1fr;
            align-items: center;
            gap: 22px;
            box-sizing: border-box;
            position: sticky;
            top: 0;
            z-index: 999;
            box-shadow: 0 4px 14px rgba(62, 39, 35, 0.22);
          }

          .center-navbar-left {
            display: flex;
            justify-content: flex-start;
            align-items: center;
          }

          .center-navbar-middle {
            display: flex;
            justify-content: center;
            align-items: center;
            width: 100%;
          }

          .center-navbar-right {
            display: flex;
            justify-content: flex-end;
            align-items: center;
          }

          .center-classic-logo {
            color: #fff8ef;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 31px;
            font-weight: 900;
            text-decoration: none;
            white-space: nowrap;
            letter-spacing: 0.3px;
          }

          .center-classic-logo:hover {
            color: #ead7bd;
          }

          .center-classic-search {
            width: 100%;
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .center-classic-search input {
            flex: 1;
            height: 42px;
            border-radius: 24px;
            border: 1px solid #c8a77a;
            background: #fff8ef;
            color: #3e2723;
            padding: 0 16px;
            font-size: 14px;
            font-weight: 700;
            outline: none;
          }

          .center-classic-search input::placeholder {
            color: #7a5c44;
          }

          .center-classic-search button {
            height: 42px;
            border-radius: 24px;
            border: 1px solid #c8a77a;
            background: #7a4f2a;
            color: #fff8ef;
            padding: 0 20px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, "Times New Roman", serif;
          }

          .center-classic-search button:hover {
            background: #5c371d;
          }

          .center-login-link {
            background: transparent;
            color: #fff8ef;
            border: 1px solid #c8a77a;
            text-decoration: none;
            padding: 9px 18px;
            border-radius: 24px;
            font-family: Georgia, "Times New Roman", serif;
            font-weight: 900;
            white-space: nowrap;
          }

          .center-login-link:hover {
            background: #fff8ef;
            color: #3e2723;
          }

          .center-profile-icon {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            border: 1px solid #c8a77a;
            background: #fff8ef;
            color: #3e2723;
            font-size: 20px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
          }

          .center-profile-icon:hover {
            background: #ead7bd;
          }

          @media (max-width: 900px) {
            .center-classic-navbar {
              display: flex;
              flex-direction: column;
              justify-content: center;
              padding: 14px 16px;
              gap: 13px;
            }

            .center-navbar-left,
            .center-navbar-middle,
            .center-navbar-right {
              width: 100%;
              justify-content: center;
            }

            .center-classic-logo {
              font-size: 30px;
              text-align: center;
            }

            .center-classic-search {
              max-width: 560px;
            }
          }

          @media (max-width: 480px) {
            .center-classic-search {
              flex-direction: column;
            }

            .center-classic-search input,
            .center-classic-search button {
              width: 100%;
            }
          }
        `}
      </style>
    </nav>
  );
}

export default Navbar;