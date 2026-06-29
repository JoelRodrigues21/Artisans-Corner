import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { HiShoppingCart, HiUserCircle, HiHeart } from "react-icons/hi2";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchText(params.get("search") || "");
  }, [location.search]);

  const getProfilePath = () => {
    if (!user) return "/login";
    if (user.role === "buyer") return "/buyer";
    if (user.role === "vendor") return "/vendor";
    if (user.role === "admin") return "/admin";
    return "/login";
  };

  const searchProducts = (e) => {
    e.preventDefault();

    const cleanSearch = searchText.trim();

    if (cleanSearch === "") {
      navigate("/");
    } else {
      navigate(`/?search=${encodeURIComponent(cleanSearch)}`);
    }
  };

  const navItemStyle = {
    color: "white",
    textDecoration: "none",
    fontWeight: "700",
    fontSize: "15px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "3px",
    minWidth: "70px",
  };

  return (
    <nav
      style={{
        background: "#3e2723",
        color: "white",
        padding: "22px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 999,
        minHeight: "92px",
        boxSizing: "border-box",
      }}
    >
      <Link
        to="/"
        style={{
          color: "white",
          textDecoration: "none",
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily: "Georgia, serif",
            fontSize: "clamp(32px, 2.4vw, 48px)",
            fontWeight: "800",
            letterSpacing: "0.5px",
            whiteSpace: "nowrap",
          }}
        >
          Artisan's Corner
        </h1>
      </Link>

      <form
        onSubmit={searchProducts}
        style={{
          position: "absolute",
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(560px, 34vw)",
          height: "46px",
          display: "flex",
          alignItems: "center",
          backgroundColor: "#fff8ef",
          border: "2px solid #c8a77a",
          borderRadius: "40px",
          overflow: "hidden",
          boxShadow: "0 3px 10px rgba(0,0,0,0.22)",
        }}
      >
        <input
          type="text"
          placeholder="Search handmade treasures..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "12px 20px",
            fontSize: "16px",
            fontFamily: "Georgia, serif",
            backgroundColor: "transparent",
            color: "#3e2723",
            width: "100%",
          }}
        />

        <button
          type="submit"
          style={{
            backgroundColor: "#7a4f2a",
            color: "white",
            border: "none",
            padding: "13px 22px",
            cursor: "pointer",
            fontWeight: "800",
            fontSize: "15px",
            height: "100%",
            borderRadius: 0,
          }}
        >
          Search
        </button>
      </form>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "28px",
        }}
      >
        {user?.role === "buyer" && (
          <>
            <Link to="/wishlist" style={navItemStyle}>
              <HiHeart size={31} />
              <span>Wishlist</span>
            </Link>

            <Link to="/cart" style={navItemStyle}>
              <HiShoppingCart size={31} />
              <span>Cart</span>
            </Link>
          </>
        )}

        <Link to={getProfilePath()} style={navItemStyle}>
          <HiUserCircle size={33} />
          <span>Profile</span>
        </Link>
      </div>
    </nav>
  );
}

export default Navbar;