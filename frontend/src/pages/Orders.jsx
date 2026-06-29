import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders");

      let allOrders = Array.isArray(res.data) ? res.data : [];

      if (user?.role === "buyer") {
        allOrders = allOrders.filter(
          (order) =>
            order.buyer?._id === user._id ||
            order.buyer === user._id ||
            order.buyer?.email === user.email
        );
      }

      allOrders.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setOrders(allOrders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getProduct = (item) => {
    return item.product || item.productId || item;
  };

  const getOrderTotal = (order) => {
    if (order.totalAmount) return order.totalAmount;

    return order.products?.reduce((sum, item) => {
      const product = getProduct(item);
      const quantity = item.quantity || 1;
      return sum + Number(product?.price || 0) * quantity;
    }, 0);
  };

  return (
    <div className="classic-orders-page">
      <div className="classic-orders-container">
        <div className="orders-hero">
          <div>
            <p>Purchase History</p>
            <h1>My Orders</h1>
            <span>Track your handmade product orders here.</span>
          </div>

          <button onClick={() => navigate("/")}>Continue Shopping</button>
        </div>

        {loading ? (
          <div className="orders-empty-card">
            <h2>Loading your orders...</h2>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-card">
            <h2>No orders yet.</h2>
            <p>Your placed orders will appear here.</p>
            <button onClick={() => navigate("/")}>Start Shopping</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, index) => (
              <div key={order._id} className="classic-order-card">
                <div className="order-card-header">
                  <div>
                    <p>Order {index + 1}</p>
                    <h2>Placed on {formatDate(order.createdAt)}</h2>
                  </div>

                  <div className="order-header-right">
                    <h2>₹{getOrderTotal(order)}</h2>
                    <span>{order.status || "Processing"}</span>
                  </div>
                </div>

                <div className="order-progress-box">
                  <div className="progress-step active">
                    <span></span>
                    <p>Placed</p>
                  </div>

                  <div className="progress-line active"></div>

                  <div className="progress-step active">
                    <span></span>
                    <p>Processing</p>
                  </div>

                  <div className="progress-line"></div>

                  <div className="progress-step">
                    <span></span>
                    <p>Delivered</p>
                  </div>
                </div>

                <div className="order-products-list">
                  {order.products?.map((item, productIndex) => {
                    const product = getProduct(item);
                    const quantity = item.quantity || 1;
                    const price = Number(product?.price || 0);
                    const itemTotal = price * quantity;

                    return (
                      <div
                        key={product?._id || productIndex}
                        className="order-product-row"
                      >
                        <img
                          src={product?.image}
                          alt={product?.name}
                          className="order-product-img"
                        />

                        <div className="order-product-info">
                          <Link to={`/product/${product?._id}`}>
                            {product?.name}
                          </Link>

                          <p>Quantity: {quantity}</p>

                          <p className="order-address">
                            Delivery Address: {order.shippingAddress}
                          </p>

                          <div className="order-status-note">
                            Your order is being processed
                          </div>
                        </div>

                        <div className="order-price-box">
                          <h3>₹{itemTotal}</h3>
                          <p>
                            ₹{price} × {quantity}
                          </p>

                          <Link
                            to={`/product/${product?._id}`}
                            className="review-link"
                          >
                            View / Review Product
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>
        {`
          .classic-orders-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.8), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            padding: clamp(18px, 2vw, 34px);
            box-sizing: border-box;
          }

          .classic-orders-container {
            width: 100%;
            max-width: 1250px;
            margin: 0 auto;
          }

          .orders-hero {
            background: rgba(255, 250, 242, 0.96);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: clamp(24px, 2.5vw, 40px);
            margin-bottom: 26px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
          }

          .orders-hero p {
            margin: 0 0 6px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.7px;
          }

          .orders-hero h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(38px, 3vw, 58px);
          }

          .orders-hero span {
            display: block;
            margin-top: 8px;
            color: #5d4037;
            font-weight: 700;
          }

          .orders-hero button,
          .orders-empty-card button {
            background: #7a4f2a;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 13px 24px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, serif;
          }

          .orders-list {
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .classic-order-card {
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            overflow: hidden;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .order-card-header {
            background: linear-gradient(135deg, #3e2723, #5c371d);
            color: #fff8ef;
            padding: 22px 28px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
          }

          .order-card-header p {
            margin: 0 0 6px;
            color: #ead7bd;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.6px;
          }

          .order-card-header h2 {
            margin: 0;
            font-family: Georgia, serif;
            font-size: clamp(22px, 1.5vw, 32px);
          }

          .order-header-right {
            text-align: right;
          }

          .order-header-right span {
            display: inline-block;
            margin-top: 8px;
            background: #fff1d8;
            color: #3e2723;
            padding: 7px 14px;
            border-radius: 30px;
            font-weight: 900;
          }

          .order-progress-box {
            padding: 22px 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff8ef;
            border-bottom: 1px solid #ead7bd;
          }

          .progress-step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 7px;
            min-width: 90px;
          }

          .progress-step span {
            width: 18px;
            height: 18px;
            border-radius: 50%;
            border: 3px solid #c8a77a;
            background: #fffaf2;
          }

          .progress-step.active span {
            background: #2e7d32;
            border-color: #2e7d32;
          }

          .progress-step p {
            margin: 0;
            color: #5d4037;
            font-weight: 800;
            font-size: 14px;
          }

          .progress-line {
            width: min(130px, 14vw);
            height: 3px;
            background: #d7b98a;
            margin-bottom: 28px;
          }

          .progress-line.active {
            background: #2e7d32;
          }

          .order-products-list {
            display: flex;
            flex-direction: column;
          }

          .order-product-row {
            display: grid;
            grid-template-columns: 125px 1fr 190px;
            gap: 22px;
            padding: 24px 28px;
            border-bottom: 1px solid #ead7bd;
            align-items: center;
          }

          .order-product-row:last-child {
            border-bottom: none;
          }

          .order-product-img {
            width: 125px;
            height: 115px;
            object-fit: cover;
            border-radius: 14px;
            border: 1px solid #d7b98a;
            background: #f5f5f5;
          }

          .order-product-info a {
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(20px, 1.3vw, 28px);
            font-weight: 900;
            text-decoration: none;
          }

          .order-product-info a:hover {
            text-decoration: underline;
          }

          .order-product-info p {
            margin: 8px 0;
            color: #5d4037;
            font-weight: 700;
            line-height: 1.5;
          }

          .order-address {
            background: #fff8ef;
            border-left: 5px solid #7a4f2a;
            padding: 10px 14px;
            border-radius: 10px;
            margin-top: 12px !important;
          }

          .order-status-note {
            display: inline-block;
            margin-top: 8px;
            background: #fff1d8;
            color: #5d4037;
            padding: 8px 13px;
            border-radius: 30px;
            font-weight: 900;
            font-size: 14px;
          }

          .order-price-box {
            text-align: right;
          }

          .order-price-box h3 {
            margin: 0;
            color: #3e2723;
            font-size: 26px;
            font-family: "Segoe UI", Arial, sans-serif;
          }

          .order-price-box p {
            margin: 8px 0 16px;
            color: #7a5c44;
            font-weight: 800;
          }

          .review-link {
            display: inline-block;
            background: #7a4f2a;
            color: white;
            text-decoration: none;
            padding: 11px 16px;
            border-radius: 30px;
            font-weight: 900;
            font-size: 14px;
          }

          .review-link:hover {
            background: #5c371d;
          }

          .orders-empty-card {
            background: rgba(255, 250, 242, 0.96);
            border: 1px solid #c8a77a;
            border-radius: 18px;
            padding: 34px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .orders-empty-card h2 {
            color: #3e2723;
            font-family: Georgia, serif;
          }

          .orders-empty-card p {
            color: #5d4037;
          }

          @media (max-width: 800px) {
            .order-product-row {
              grid-template-columns: 100px 1fr;
              gap: 16px;
              padding: 18px;
            }

            .order-product-img {
              width: 100px;
              height: 100px;
            }

            .order-price-box {
              grid-column: 1 / 3;
              text-align: left;
              border-top: 1px solid #ead7bd;
              padding-top: 14px;
            }

            .order-progress-box {
              overflow-x: auto;
              justify-content: flex-start;
            }

            .order-header-right {
              text-align: left;
            }
          }

          @media (max-width: 520px) {
            .order-product-row {
              grid-template-columns: 85px 1fr;
            }

            .order-product-img {
              width: 85px;
              height: 85px;
            }

            .order-product-info a {
              font-size: 18px;
            }

            .review-link {
              width: 100%;
              text-align: center;
              box-sizing: border-box;
            }
          }
            /* Full responsive My Orders page */

.classic-orders-container {
  width: 100% !important;
  max-width: none !important;
  margin: 0 !important;
}

.classic-orders-page {
  width: 100% !important;
  padding: clamp(12px, 2vw, 32px) !important;
  box-sizing: border-box !important;
}

.orders-hero {
  width: 100% !important;
  box-sizing: border-box !important;
}

.classic-order-card {
  width: 100% !important;
  box-sizing: border-box !important;
}

.order-product-row {
  grid-template-columns: clamp(95px, 9vw, 135px) minmax(0, 1fr) clamp(155px, 15vw, 210px) !important;
  gap: clamp(14px, 2vw, 24px) !important;
  padding: clamp(16px, 2vw, 28px) !important;
}

.order-product-img {
  width: clamp(95px, 9vw, 135px) !important;
  height: clamp(90px, 8vw, 125px) !important;
}

.order-product-info {
  min-width: 0 !important;
}

.order-product-info a {
  display: block !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
}

.order-address {
  word-break: break-word !important;
}

.order-price-box {
  min-width: 0 !important;
}

/* Laptop and tablet */
@media (max-width: 1000px) {
  .order-product-row {
    grid-template-columns: 115px minmax(0, 1fr) !important;
  }

  .order-product-img {
    width: 115px !important;
    height: 105px !important;
  }

  .order-price-box {
    grid-column: 1 / 3 !important;
    text-align: left !important;
    border-top: 1px solid #ead7bd !important;
    padding-top: 14px !important;
  }

  .review-link {
    margin-top: 6px !important;
  }
}

/* Tablet and large phone */
@media (max-width: 700px) {
  .orders-hero {
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .orders-hero button {
    width: 100% !important;
  }

  .order-card-header {
    flex-direction: column !important;
    align-items: flex-start !important;
  }

  .order-header-right {
    text-align: left !important;
  }

  .order-progress-box {
    justify-content: flex-start !important;
    overflow-x: auto !important;
    padding: 18px !important;
  }

  .progress-step {
    min-width: 75px !important;
  }

  .progress-line {
    min-width: 60px !important;
  }

  .order-product-row {
    grid-template-columns: 95px minmax(0, 1fr) !important;
    gap: 13px !important;
    padding: 15px !important;
  }

  .order-product-img {
    width: 95px !important;
    height: 90px !important;
  }

  .order-product-info a {
    font-size: 18px !important;
  }

  .order-product-info p {
    font-size: 14px !important;
  }

  .order-status-note {
    font-size: 12px !important;
  }
}

/* Small phone */
@media (max-width: 480px) {
  .classic-orders-page {
    padding: 10px !important;
  }

  .orders-hero {
    padding: 20px !important;
    border-radius: 16px !important;
  }

  .orders-hero h1 {
    font-size: 32px !important;
  }

  .classic-order-card {
    border-radius: 16px !important;
  }

  .order-card-header {
    padding: 18px !important;
  }

  .order-card-header h2 {
    font-size: 20px !important;
  }

  .order-product-row {
    grid-template-columns: 82px minmax(0, 1fr) !important;
    padding: 12px !important;
  }

  .order-product-img {
    width: 82px !important;
    height: 82px !important;
    border-radius: 10px !important;
  }

  .order-product-info a {
    font-size: 16px !important;
  }

  .order-address {
    padding: 8px 10px !important;
    font-size: 13px !important;
  }

  .order-price-box {
    grid-column: 1 / 3 !important;
  }

  .order-price-box h3 {
    font-size: 22px !important;
  }

  .review-link {
    width: 100% !important;
    text-align: center !important;
    box-sizing: border-box !important;
  }
}
        `}
      </style>
    </div>
  );
}

export default Orders;