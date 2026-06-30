import { useNavigate } from "react-router-dom";
import API from "../services/api";

function BuyerDashboard() {
  const navigate = useNavigate();

  let user = null;

  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    user = null;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleBecomeSeller = async () => {
    try {
      const res = await API.put("/auth/become-seller");

      localStorage.setItem("user", JSON.stringify(res.data.user));

      alert("Seller account activated successfully. You can now sell products.");

      navigate("/vendor");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to activate seller account");
    }
  };

  return (
    <div className="buyer-full-page">
      <div className="buyer-full-container">
        <section className="buyer-full-hero">
          <div className="buyer-full-hero-text">
            <p>Buyer Profile</p>
            <h1>Welcome, {user?.name || "Buyer"}</h1>
            <span>Manage your profile, orders, cart, and wishlist here.</span>
          </div>

          <button className="buyer-full-logout" onClick={handleLogout}>
            Logout
          </button>
        </section>

        <section className="buyer-full-grid">
          <div className="buyer-full-card" onClick={() => navigate("/orders")}>
            <div className="buyer-full-icon">📦</div>
            <h2>My Orders</h2>
            <p>View your order history and delivery status.</p>
          </div>

          <div className="buyer-full-card" onClick={() => navigate("/cart")}>
            <div className="buyer-full-icon">🛒</div>
            <h2>My Cart</h2>
            <p>Continue checkout with your selected products.</p>
          </div>

          <div className="buyer-full-card" onClick={() => navigate("/wishlist")}>
            <div className="buyer-full-icon">♡</div>
            <h2>Wishlist</h2>
            <p>See your saved handmade products.</p>
          </div>

          <div className="buyer-full-card" onClick={() => navigate("/")}>
            <div className="buyer-full-icon">🏺</div>
            <h2>Continue Shopping</h2>
            <p>Browse more handmade treasures.</p>
          </div>
        </section>

        <section className="buyer-full-profile">
          <div className="buyer-full-heading">
            <p>Account Details</p>
            <h2>Profile Information</h2>
          </div>

          <div className="buyer-full-info-grid">
            <div className="buyer-full-info">
              <span>Name</span>
              <h3>{user?.name || "Not available"}</h3>
            </div>

            <div className="buyer-full-info">
              <span>Email</span>
              <h3>{user?.email || "Not available"}</h3>
            </div>

            <div className="buyer-full-info">
              <span>Role</span>
              <h3>{user?.role || "buyer"}</h3>
            </div>
          </div>

          {user?.role === "buyer" && (
            <div className="buyer-full-seller">
              <div className="buyer-full-seller-text">
                <p>Seller Account</p>
                <h2>Want to sell your handmade products?</h2>
                <span>
                  Click below to activate seller access using this same account.
                </span>
              </div>

              <button onClick={handleBecomeSeller}>
                Become a Seller / Sell
              </button>
            </div>
          )}
        </section>
      </div>

      <style>
        {`
          html,
          body,
          #root {
            width: 100%;
            max-width: 100%;
            margin: 0;
            padding: 0;
            overflow-x: hidden;
          }

          .buyer-full-page,
          .buyer-full-page * {
            box-sizing: border-box;
          }

          .buyer-full-page {
            width: 100%;
            max-width: 100%;
            min-height: 100vh;
            overflow-x: hidden;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.7), transparent 34%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            padding: 16px;
          }

          .buyer-full-container {
            width: 100%;
            max-width: none;
            margin: 0;
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .buyer-full-hero,
          .buyer-full-profile {
            width: 100%;
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 18px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .buyer-full-hero {
            padding: 28px 34px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
          }

          .buyer-full-hero-text {
            min-width: 0;
            flex: 1;
          }

          .buyer-full-hero-text p,
          .buyer-full-heading p,
          .buyer-full-seller-text p {
            margin: 0 0 6px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            font-size: 13px;
          }

          .buyer-full-hero-text h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(34px, 4vw, 58px);
            line-height: 1.08;
            overflow-wrap: anywhere;
          }

          .buyer-full-hero-text span {
            display: block;
            margin-top: 8px;
            color: #5d4037;
            font-weight: 700;
            line-height: 1.4;
          }

          .buyer-full-logout {
            width: 220px;
            max-width: 100%;
            background: linear-gradient(135deg, #8b1e1e, #5c0f0f);
            color: #fff8ef;
            border: 1px solid #d7b98a;
            border-radius: 40px;
            padding: 13px 24px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 15px;
            box-shadow: 0 6px 16px rgba(92, 15, 15, 0.25);
          }

          .buyer-full-grid {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 18px;
          }

          .buyer-full-card {
            width: 100%;
            min-width: 0;
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 18px;
            padding: 26px;
            cursor: pointer;
            box-shadow: 0 8px 20px rgba(62, 39, 35, 0.12);
            transition: 0.2s ease;
          }

          .buyer-full-card:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 24px rgba(62, 39, 35, 0.17);
          }

          .buyer-full-icon {
            width: 48px;
            height: 48px;
            background: #fff1d8;
            border: 1px solid #d7b98a;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 23px;
            margin-bottom: 14px;
          }

          .buyer-full-card h2 {
            margin: 0 0 8px;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(24px, 2vw, 32px);
            line-height: 1.12;
            overflow-wrap: anywhere;
          }

          .buyer-full-card p {
            margin: 0;
            color: #5d4037;
            font-weight: 700;
            line-height: 1.45;
            overflow-wrap: anywhere;
          }

          .buyer-full-profile {
            padding: 28px 34px;
          }

          .buyer-full-heading h2 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(32px, 3.2vw, 48px);
            line-height: 1.1;
            overflow-wrap: anywhere;
          }

          .buyer-full-info-grid {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 18px;
            margin-top: 24px;
          }

          .buyer-full-info {
            min-width: 0;
            background: #fff8ef;
            border: 1px solid #ead7bd;
            border-radius: 15px;
            padding: 17px;
          }

          .buyer-full-info span {
            display: block;
            color: #7a5c44;
            font-size: 12px;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            margin-bottom: 8px;
          }

          .buyer-full-info h3 {
            margin: 0;
            color: #3e2723;
            font-size: 17px;
            line-height: 1.35;
            overflow-wrap: anywhere;
          }

          .buyer-full-seller {
            width: 100%;
            margin-top: 26px;
            background: linear-gradient(135deg, #3e2723, #5c371d);
            border: 1px solid #c8a77a;
            border-radius: 18px;
            padding: 24px 28px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
          }

          .buyer-full-seller-text {
            min-width: 0;
            flex: 1;
          }

          .buyer-full-seller-text p {
            color: #ead7bd;
          }

          .buyer-full-seller-text h2 {
            margin: 0;
            color: #fff8ef;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(25px, 2.4vw, 36px);
            line-height: 1.15;
            overflow-wrap: anywhere;
          }

          .buyer-full-seller-text span {
            display: block;
            margin-top: 8px;
            color: #fff1d8;
            font-weight: 700;
            line-height: 1.4;
          }

          .buyer-full-seller button {
            flex-shrink: 0;
            background: #fff1d8;
            color: #3e2723;
            border: 1px solid #d7b98a;
            border-radius: 30px;
            padding: 13px 24px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, "Times New Roman", serif;
            white-space: nowrap;
          }

          .buyer-full-seller button:hover {
            background: #d7b98a;
          }

          @media (max-width: 1100px) {
            .buyer-full-grid {
              grid-template-columns: repeat(2, minmax(0, 1fr));
            }

            .buyer-full-info-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 750px) {
            .buyer-full-page {
              padding: 10px;
            }

            .buyer-full-hero {
              flex-direction: column;
              align-items: stretch;
              padding: 22px;
            }

            .buyer-full-logout {
              width: 100%;
            }

            .buyer-full-grid {
              grid-template-columns: 1fr;
              gap: 12px;
            }

            .buyer-full-profile {
              padding: 22px;
            }

            .buyer-full-seller {
              flex-direction: column;
              align-items: stretch;
              padding: 22px;
            }

            .buyer-full-seller button {
              width: 100%;
              white-space: normal;
            }
          }

          @media (max-width: 420px) {
            .buyer-full-page {
              padding: 8px;
            }

            .buyer-full-hero,
            .buyer-full-profile,
            .buyer-full-card,
            .buyer-full-seller {
              border-radius: 14px;
            }

            .buyer-full-hero,
            .buyer-full-profile,
            .buyer-full-card,
            .buyer-full-seller {
              padding: 16px;
            }

            .buyer-full-hero-text h1 {
              font-size: 30px;
            }

            .buyer-full-heading h2 {
              font-size: 28px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default BuyerDashboard;