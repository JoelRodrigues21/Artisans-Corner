import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function AdminDashboard() {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  let user = null;

  try {
    const savedUser = localStorage.getItem("user");
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    user = null;
  }

  const statusOptions = ["Processing", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const productRes = await API.get("/products");
      const orderRes = await API.get("/orders");

      setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      setOrders(Array.isArray(orderRes.data) ? orderRes.data : []);
    } catch (error) {
      console.log(error);
      alert("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await API.put(`/orders/${orderId}/status`, { status });
      const updatedOrder = res.data?.order;

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? updatedOrder || { ...order, status }
            : order
        )
      );

      alert("Order status updated");
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to update order status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin-login");
  };

  const getOrderTotal = (order) => {
    if (order.totalAmount) return Number(order.totalAmount || 0);

    return (
      order.products?.reduce((sum, item) => {
        const product = item.product || item.productId || item;
        const price = Number(item.price || product?.price || 0);
        const quantity = Number(item.quantity || 1);
        return sum + price * quantity;
      }, 0) || 0
    );
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + getOrderTotal(order),
    0
  );

  const platformCommission = Math.round(totalRevenue * 0.05);
  const vendorPayout = totalRevenue - platformCommission;

  return (
    <div className="admin-classic-page">
      <div className="admin-classic-container">
        <section className="admin-classic-hero">
          <div>
            <p>Admin Panel</p>
            <h1>Welcome, {user?.name || "Admin"}</h1>
            <span>
              Manage marketplace products, orders, revenue, and commission.
            </span>
          </div>

          <button onClick={handleLogout}>Logout</button>
        </section>

        <section className="admin-classic-stats">
          <div className="admin-classic-stat-card">
            <p>Total Products</p>
            <h2>{products.length}</h2>
          </div>

          <div className="admin-classic-stat-card">
            <p>Total Orders</p>
            <h2>{orders.length}</h2>
          </div>

          <div className="admin-classic-stat-card">
            <p>Total Revenue</p>
            <h2>₹{totalRevenue}</h2>
          </div>

          <div className="admin-classic-stat-card">
            <p>Platform Fee 5%</p>
            <h2>₹{platformCommission}</h2>
          </div>

          <div className="admin-classic-stat-card">
            <p>Vendor Payout 95%</p>
            <h2>₹{vendorPayout}</h2>
          </div>
        </section>

        {loading ? (
          <section className="admin-classic-section">
            <h2>Loading admin data...</h2>
          </section>
        ) : (
          <>
            <section className="admin-classic-section">
              <div className="admin-section-title">
                <p>Marketplace Products</p>
                <h2>All Products</h2>
              </div>

              {products.length === 0 ? (
                <div className="admin-empty-box">No products found.</div>
              ) : (
                <div className="admin-table-scroll">
                  <table className="admin-classic-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Vendor</th>
                        <th>Price</th>
                        <th>Stock</th>
                      </tr>
                    </thead>

                    <tbody>
                      {products.map((product) => (
                        <tr key={product._id}>
                          <td>{product.name || "Product"}</td>
                          <td>
                            {product.vendor?.name ||
                              product.vendorName ||
                              "Vendor"}
                          </td>
                          <td>₹{product.price || 0}</td>
                          <td>{product.stock ?? "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="admin-classic-section">
              <div className="admin-section-title">
                <p>Order Management</p>
                <h2>All Orders</h2>
              </div>

              {orders.length === 0 ? (
                <div className="admin-empty-box">No orders found.</div>
              ) : (
                <div className="admin-table-scroll">
                  <table className="admin-classic-table">
                    <thead>
                      <tr>
                        <th>Buyer</th>
                        <th>Total</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Update Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {orders.map((order) => (
                        <tr key={order._id}>
                          <td>
                            {order.buyer?.name ||
                              order.buyerName ||
                              "Buyer"}
                          </td>
                          <td>₹{getOrderTotal(order)}</td>
                          <td>{order.paymentStatus || "Paid"}</td>
                          <td>
                            <span className={`admin-status ${order.status}`}>
                              {order.status || "Processing"}
                            </span>
                          </td>
                          <td>
                            <select
                              value={order.status || "Processing"}
                              onChange={(e) =>
                                updateOrderStatus(order._id, e.target.value)
                              }
                            >
                              {statusOptions.map((status) => (
                                <option key={status} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <style>
        {`
          .admin-classic-page,
          .admin-classic-page * {
            box-sizing: border-box;
          }

          .admin-classic-page {
            width: 100%;
            min-height: 100vh;
            overflow-x: hidden;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.72), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            padding: 16px;
          }

          .admin-classic-container {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .admin-classic-hero,
          .admin-classic-section,
          .admin-classic-stat-card {
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 18px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .admin-classic-hero {
            padding: 28px 34px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 18px;
            flex-wrap: wrap;
          }

          .admin-classic-hero p,
          .admin-classic-stat-card p,
          .admin-section-title p {
            margin: 0 0 7px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            font-size: 13px;
          }

          .admin-classic-hero h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(34px, 4vw, 58px);
            line-height: 1.08;
          }

          .admin-classic-hero span {
            display: block;
            margin-top: 8px;
            color: #5d4037;
            font-weight: 700;
            line-height: 1.4;
          }

          .admin-classic-hero button {
            background: linear-gradient(135deg, #8b1e1e, #5c0f0f);
            color: #fff8ef;
            border: 1px solid #d7b98a;
            border-radius: 40px;
            padding: 13px 28px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 15px;
            box-shadow: 0 6px 16px rgba(92, 15, 15, 0.25);
          }

          .admin-classic-stats {
            width: 100%;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
            gap: 16px;
          }

          .admin-classic-stat-card {
            padding: 22px;
          }

          .admin-classic-stat-card h2 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(26px, 2.4vw, 36px);
            line-height: 1.1;
            overflow-wrap: anywhere;
          }

          .admin-classic-section {
            width: 100%;
            padding: 26px;
            overflow: hidden;
          }

          .admin-section-title h2 {
            margin: 0 0 20px;
            color: #3e2723;
            font-family: Georgia, "Times New Roman", serif;
            font-size: clamp(30px, 3vw, 46px);
            line-height: 1.1;
          }

          .admin-table-scroll {
            width: 100%;
            overflow-x: auto;
            border: 1px solid #ead7bd;
            border-radius: 14px;
          }

          .admin-classic-table {
            width: 100%;
            min-width: 760px;
            border-collapse: collapse;
            background: #fffaf2;
          }

          .admin-classic-table th {
            background: #3e2723;
            color: #fff8ef;
            text-align: left;
            padding: 15px;
            font-family: Georgia, "Times New Roman", serif;
            font-size: 15px;
          }

          .admin-classic-table td {
            padding: 15px;
            border-bottom: 1px solid #ead7bd;
            color: #3e2723;
            font-weight: 800;
            vertical-align: middle;
          }

          .admin-classic-table tr:last-child td {
            border-bottom: none;
          }

          .admin-classic-table select {
            width: 170px;
            max-width: 100%;
            padding: 10px 12px;
            border-radius: 10px;
            border: 1px solid #c8a77a;
            background: #fff8ef;
            color: #3e2723;
            font-weight: 900;
            outline: none;
          }

          .admin-status {
            display: inline-block;
            background: #fff1d8;
            color: #3e2723;
            padding: 7px 13px;
            border-radius: 30px;
            font-weight: 900;
          }

          .admin-status.Delivered {
            background: #dff5df;
            color: #2e7d32;
          }

          .admin-status.Shipped {
            background: #e3f2fd;
            color: #1565c0;
          }

          .admin-status.Cancelled {
            background: #ffebee;
            color: #b71c1c;
          }

          .admin-empty-box {
            background: #fff8ef;
            border: 1px solid #ead7bd;
            border-radius: 14px;
            padding: 18px;
            color: #5d4037;
            font-weight: 900;
          }

          @media (max-width: 750px) {
            .admin-classic-page {
              padding: 10px;
            }

            .admin-classic-hero {
              flex-direction: column;
              align-items: stretch;
              padding: 22px;
            }

            .admin-classic-hero button {
              width: 100%;
            }

            .admin-classic-section {
              padding: 18px;
            }

            .admin-classic-stat-card {
              padding: 18px;
            }
          }

          @media (max-width: 420px) {
            .admin-classic-page {
              padding: 8px;
            }

            .admin-classic-hero,
            .admin-classic-section,
            .admin-classic-stat-card {
              border-radius: 14px;
            }

            .admin-classic-hero,
            .admin-classic-section {
              padding: 16px;
            }

            .admin-classic-hero h1 {
              font-size: 30px;
            }

            .admin-section-title h2 {
              font-size: 28px;
            }
          }
        `}
      </style>
    </div>
  );
}

export default AdminDashboard;