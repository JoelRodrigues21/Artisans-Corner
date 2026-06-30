import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function Orders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user"));

  const canSeeEarnings = user?.role === "vendor" || user?.role === "admin";
  const canUpdateStatus = user?.role === "vendor" || user?.role === "admin";

  const statusOptions = ["Processing", "Shipped", "Delivered", "Cancelled"];

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

      allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(allOrders);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await API.put(`/orders/${orderId}/status`, {
        status: newStatus,
      });

      const updatedOrder = res.data?.order;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? updatedOrder || { ...order, status: newStatus }
            : order
        )
      );

      alert("Order status updated successfully");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to update order status");
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

  const getItemPrice = (item) => {
    const product = getProduct(item);
    return Number(item.price || product?.price || 0);
  };

  const getOrderTotal = (order) => {
    if (order.totalAmount) return Number(order.totalAmount);

    return order.products?.reduce((sum, item) => {
      const quantity = Number(item.quantity || 1);
      return sum + getItemPrice(item) * quantity;
    }, 0);
  };

  const getPlatformFee = (order) => {
    if (order.totalPlatformFee !== undefined) {
      return Number(order.totalPlatformFee || 0);
    }

    return Math.round(getOrderTotal(order) * 0.05);
  };

  const getVendorPayout = (order) => {
    if (order.totalVendorPayout !== undefined) {
      return Number(order.totalVendorPayout || 0);
    }

    return getOrderTotal(order) - getPlatformFee(order);
  };

  const getPaymentStatusClass = (status) => {
    if (status === "Paid") return "paid";
    if (status === "Failed") return "failed";
    return "pending";
  };

  const getProgressClass = (orderStatus, step) => {
    const status = orderStatus || "Processing";

    if (status === "Cancelled") return "";

    const levels = {
      Placed: 1,
      Processing: 2,
      Shipped: 3,
      Delivered: 4,
    };

    return levels[status] >= levels[step] ? "active" : "";
  };

  const getPaymentMethodText = (paymentMethod) => {
    if (paymentMethod === "Simulated Payment") {
      return "Demo Payment (Test Mode)";
    }

    return paymentMethod || "Demo Payment (Test Mode)";
  };

  return (
    <div className="classic-orders-page">
      <div className="classic-orders-container">
        <div className="orders-hero">
          <div>
            <p>Purchase History</p>
            <h1>My Orders</h1>
            <span>Track your handmade product orders and payments here.</span>
          </div>
        </div>

        {loading ? (
          <div className="orders-empty-card">
            <h2>Loading your orders...</h2>
          </div>
        ) : orders.length === 0 ? (
          <div className="orders-empty-card">
            <h2>No orders yet.</h2>
            <p>Your placed orders will appear here.</p>

            {user?.role === "buyer" && (
              <button onClick={() => navigate("/")}>Start Shopping</button>
            )}
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order, index) => {
              const orderTotal = getOrderTotal(order);
              const platformFee = getPlatformFee(order);
              const vendorPayout = getVendorPayout(order);

              return (
                <div key={order._id} className="classic-order-card">
                  <div className="order-card-header">
                    <div>
                      <p>Order {index + 1}</p>
                      <h2>Placed on {formatDate(order.createdAt)}</h2>
                    </div>

                    <div className="order-header-right">
                      <h2>₹{orderTotal}</h2>
                      <span className={`status-pill ${order.status}`}>
                        {order.status || "Processing"}
                      </span>
                    </div>
                  </div>

                  <div className="order-payment-summary">
                    <div className="payment-summary-box">
                      <p>Payment Method</p>
                      <h3>{getPaymentMethodText(order.paymentMethod)}</h3>
                    </div>

                    <div className="payment-summary-box">
                      <p>Payment Status</p>
                      <h3
                        className={`payment-status ${getPaymentStatusClass(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus || "Paid"}
                      </h3>
                    </div>

                    {canUpdateStatus && (
                      <div className="payment-summary-box">
                        <p>Update Order Status</p>

                        <select
                          value={order.status || "Processing"}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
                          }
                          className="order-status-select"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {canSeeEarnings && (
                      <>
                        <div className="payment-summary-box">
                          <p>Platform Commission 5%</p>
                          <h3>₹{platformFee}</h3>
                        </div>

                        <div className="payment-summary-box">
                          <p>Vendor Earnings 95%</p>
                          <h3>₹{vendorPayout}</h3>
                        </div>
                      </>
                    )}
                  </div>

                  {order.status === "Cancelled" ? (
                    <div className="cancelled-order-box">
                      This order has been cancelled.
                    </div>
                  ) : (
                    <div className="order-progress-box">
                      <div
                        className={`progress-step ${getProgressClass(
                          order.status,
                          "Placed"
                        )}`}
                      >
                        <span></span>
                        <p>Placed</p>
                      </div>

                      <div
                        className={`progress-line ${getProgressClass(
                          order.status,
                          "Processing"
                        )}`}
                      ></div>

                      <div
                        className={`progress-step ${getProgressClass(
                          order.status,
                          "Processing"
                        )}`}
                      >
                        <span></span>
                        <p>Processing</p>
                      </div>

                      <div
                        className={`progress-line ${getProgressClass(
                          order.status,
                          "Shipped"
                        )}`}
                      ></div>

                      <div
                        className={`progress-step ${getProgressClass(
                          order.status,
                          "Shipped"
                        )}`}
                      >
                        <span></span>
                        <p>Shipped</p>
                      </div>

                      <div
                        className={`progress-line ${getProgressClass(
                          order.status,
                          "Delivered"
                        )}`}
                      ></div>

                      <div
                        className={`progress-step ${getProgressClass(
                          order.status,
                          "Delivered"
                        )}`}
                      >
                        <span></span>
                        <p>Delivered</p>
                      </div>
                    </div>
                  )}

                  <div className="order-products-list">
                    {order.products?.map((item, productIndex) => {
                      const product = getProduct(item);
                      const quantity = Number(item.quantity || 1);
                      const price = getItemPrice(item);
                      const itemTotal = price * quantity;

                      const itemPlatformFee =
                        item.platformFee !== undefined
                          ? Number(item.platformFee || 0)
                          : Math.round(itemTotal * 0.05);

                      const itemVendorPayout =
                        item.vendorPayout !== undefined
                          ? Number(item.vendorPayout || 0)
                          : itemTotal - itemPlatformFee;

                      return (
                        <div
                          key={product?._id || productIndex}
                          className="order-product-row"
                        >
                          <img
                            src={product?.image}
                            alt={product?.name || "Product"}
                            className="order-product-img"
                          />

                          <div className="order-product-info">
                            <Link to={`/product/${product?._id}`}>
                              {product?.name || "Product"}
                            </Link>

                            <p>Quantity: {quantity}</p>

                            <p className="order-address">
                              Delivery Address: {order.shippingAddress}
                            </p>

                            {canSeeEarnings && (
                              <div className="order-mini-payment">
                                <span>Item Commission: ₹{itemPlatformFee}</span>
                                <span>Vendor Gets: ₹{itemVendorPayout}</span>
                              </div>
                            )}

                            <div className="order-status-note">
                              Current Status: {order.status || "Processing"}
                            </div>
                          </div>

                          <div className="order-price-box">
                            <h3>₹{itemTotal}</h3>
                            <p>
                              ₹{price} × {quantity}
                            </p>

                            {user?.role === "buyer" && (
                              <Link
                                to={`/product/${product?._id}`}
                                className="review-link"
                              >
                                View / Review Product
                              </Link>
                            )}

                            {user?.role !== "buyer" && (
                              <Link
                                to={`/product/${product?._id}`}
                                className="review-link"
                              >
                                View Product
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
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
            padding: clamp(12px, 2vw, 32px);
            box-sizing: border-box;
            width: 100%;
          }

          .classic-orders-container {
            width: 100%;
            max-width: none;
            margin: 0;
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
            width: 100%;
            box-sizing: border-box;
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
            width: 100%;
            box-sizing: border-box;
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

          .order-header-right span,
          .status-pill {
            display: inline-block;
            margin-top: 8px;
            background: #fff1d8;
            color: #3e2723;
            padding: 7px 14px;
            border-radius: 30px;
            font-weight: 900;
          }

          .status-pill.Delivered {
            background: #dff5df;
            color: #2e7d32;
          }

          .status-pill.Shipped {
            background: #e3f2fd;
            color: #1565c0;
          }

          .status-pill.Cancelled {
            background: #ffebee;
            color: #b71c1c;
          }

          .order-payment-summary {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
            gap: 14px;
            padding: 22px 28px;
            background: #fffaf2;
            border-bottom: 1px solid #ead7bd;
          }

          .payment-summary-box {
            background: #fff1d8;
            border: 1px solid #d7b98a;
            border-radius: 14px;
            padding: 16px;
          }

          .payment-summary-box p {
            margin: 0 0 8px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.5px;
          }

          .payment-summary-box h3 {
            margin: 0;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: clamp(18px, 1.2vw, 24px);
          }

          .order-status-select {
            width: 100%;
            padding: 11px 12px;
            border-radius: 10px;
            border: 1px solid #c8a77a;
            background: #fffaf2;
            color: #3e2723;
            font-weight: 900;
            cursor: pointer;
          }

          .payment-status.paid {
            color: #2e7d32;
          }

          .payment-status.pending {
            color: #ef6c00;
          }

          .payment-status.failed {
            color: #b71c1c;
          }

          .order-progress-box {
            padding: 22px 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff8ef;
            border-bottom: 1px solid #ead7bd;
            overflow-x: auto;
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
            width: min(100px, 12vw);
            min-width: 55px;
            height: 3px;
            background: #d7b98a;
            margin-bottom: 28px;
          }

          .progress-line.active {
            background: #2e7d32;
          }

          .cancelled-order-box {
            background: #ffebee;
            color: #b71c1c;
            padding: 18px 28px;
            font-weight: 900;
            border-bottom: 1px solid #ead7bd;
          }

          .order-products-list {
            display: flex;
            flex-direction: column;
          }

          .order-product-row {
            display: grid;
            grid-template-columns: clamp(95px, 9vw, 135px) minmax(0, 1fr) clamp(155px, 15vw, 210px);
            gap: clamp(14px, 2vw, 24px);
            padding: clamp(16px, 2vw, 28px);
            border-bottom: 1px solid #ead7bd;
            align-items: center;
          }

          .order-product-row:last-child {
            border-bottom: none;
          }

          .order-product-img {
            width: clamp(95px, 9vw, 135px);
            height: clamp(90px, 8vw, 125px);
            object-fit: cover;
            border-radius: 14px;
            border: 1px solid #d7b98a;
            background: #f5f5f5;
          }

          .order-product-info {
            min-width: 0;
          }

          .order-product-info a {
            display: block;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(20px, 1.3vw, 28px);
            font-weight: 900;
            text-decoration: none;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
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
            word-break: break-word;
          }

          .order-mini-payment {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-top: 10px;
          }

          .order-mini-payment span {
            background: #f4dfc1;
            color: #3e2723;
            border: 1px solid #d7b98a;
            padding: 7px 12px;
            border-radius: 30px;
            font-size: 13px;
            font-weight: 900;
          }

          .order-status-note {
            display: inline-block;
            margin-top: 10px;
            background: #fff1d8;
            color: #5d4037;
            padding: 8px 13px;
            border-radius: 30px;
            font-weight: 900;
            font-size: 14px;
          }

          .order-price-box {
            text-align: right;
            min-width: 0;
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

          @media (max-width: 1000px) {
            .order-product-row {
              grid-template-columns: 115px minmax(0, 1fr);
            }

            .order-product-img {
              width: 115px;
              height: 105px;
            }

            .order-price-box {
              grid-column: 1 / 3;
              text-align: left;
              border-top: 1px solid #ead7bd;
              padding-top: 14px;
            }

            .review-link {
              margin-top: 6px;
            }
          }

          @media (max-width: 700px) {
            .orders-hero {
              flex-direction: column;
              align-items: flex-start;
            }

            .order-card-header {
              flex-direction: column;
              align-items: flex-start;
            }

            .order-header-right {
              text-align: left;
            }

            .order-payment-summary {
              grid-template-columns: 1fr;
              padding: 18px;
            }

            .order-progress-box {
              justify-content: flex-start;
              padding: 18px;
            }

            .progress-step {
              min-width: 75px;
            }

            .progress-line {
              min-width: 55px;
            }

            .order-product-row {
              grid-template-columns: 95px minmax(0, 1fr);
              gap: 13px;
              padding: 15px;
            }

            .order-product-img {
              width: 95px;
              height: 90px;
            }

            .order-product-info a {
              font-size: 18px;
            }

            .order-product-info p {
              font-size: 14px;
            }

            .order-status-note {
              font-size: 12px;
            }
          }

          @media (max-width: 480px) {
            .classic-orders-page {
              padding: 10px;
            }

            .orders-hero {
              padding: 20px;
              border-radius: 16px;
            }

            .orders-hero h1 {
              font-size: 32px;
            }

            .classic-order-card {
              border-radius: 16px;
            }

            .order-card-header {
              padding: 18px;
            }

            .order-card-header h2 {
              font-size: 20px;
            }

            .order-product-row {
              grid-template-columns: 82px minmax(0, 1fr);
              padding: 12px;
            }

            .order-product-img {
              width: 82px;
              height: 82px;
              border-radius: 10px;
            }

            .order-product-info a {
              font-size: 16px;
            }

            .order-address {
              padding: 8px 10px;
              font-size: 13px;
            }

            .order-price-box {
              grid-column: 1 / 3;
            }

            .order-price-box h3 {
              font-size: 22px;
            }

            .review-link {
              width: 100%;
              text-align: center;
              box-sizing: border-box;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Orders;