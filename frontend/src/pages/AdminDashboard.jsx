import { useEffect, useState } from "react";
import API from "../services/api";

function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const usersRes = await API.get("/auth/users");
      const productsRes = await API.get("/products");
      const ordersRes = await API.get("/orders");
      const reviewsRes = await API.get("/reviews/all");

      setUsers(usersRes.data);
      setProducts(productsRes.data);
      setOrders(ordersRes.data);
      setReviews(reviewsRes.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load admin dashboard data");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    await API.delete(`/auth/users/${id}`);
    fetchAdminData();
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    await API.delete(`/products/${id}`);
    fetchAdminData();
  };

  const deleteOrder = async (id) => {
    if (!window.confirm("Delete this order?")) return;

    await API.delete(`/orders/${id}`);
    fetchAdminData();
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete this review?")) return;

    await API.delete(`/reviews/${id}`);
    fetchAdminData();
  };

  const updateOrderStatus = async (id, status) => {
    await API.put(`/orders/${id}/status`, { status });
    fetchAdminData();
  };

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  const platformFee = orders.reduce(
    (sum, order) =>
      sum +
      Number(
        order.platformFee ||
          Number(order.totalAmount || 0) * 0.05
      ),
    0
  );

  const vendorPayout = totalRevenue - platformFee;

  const cardStyle = {
    backgroundColor: "#fffaf2",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #d6c1a3",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    backgroundColor: "#fffaf2",
    borderRadius: "14px",
    overflow: "hidden",
    marginTop: "15px",
  };

  const thStyle = {
    backgroundColor: "#3e2723",
    color: "white",
    padding: "12px",
    textAlign: "left",
  };

  const tdStyle = {
    padding: "12px",
    borderBottom: "1px solid #e0cdb8",
  };

  return (
    <>
      

      <div
        style={{
          padding: "40px",
          backgroundColor: "#faf6ef",
          minHeight: "100vh",
        }}
      >
        <h1
          style={{
            fontFamily: "Georgia, serif",
            color: "#3e2723",
            marginBottom: "10px",
          }}
        >
          Admin Dashboard
        </h1>

        <p style={{ color: "#5d4037", marginBottom: "30px" }}>
          Manage users, products, orders, reviews, revenue and platform commission.
        </p>

        {/* SUMMARY CARDS */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div style={cardStyle}>
            <h3>Total Users</h3>
            <h2>{users.length}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Total Products</h3>
            <h2>{products.length}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Total Orders</h3>
            <h2>{orders.length}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Total Reviews</h3>
            <h2>{reviews.length}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Total Revenue</h3>
            <h2>₹{totalRevenue}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Platform Fee 5%</h3>
            <h2>₹{platformFee.toFixed(2)}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Vendor Payout</h3>
            <h2>₹{vendorPayout.toFixed(2)}</h2>
          </div>

          <div style={cardStyle}>
            <h3>Admin Control</h3>
            <h2>Active</h2>
          </div>
        </div>

        {/* USERS */}
        <h2>Users Management</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Name</th>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Role</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td style={tdStyle}>{user.name}</td>
                <td style={tdStyle}>{user.email}</td>
                <td style={tdStyle}>{user.role}</td>
                <td style={tdStyle}>
                  <button onClick={() => deleteUser(user._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* PRODUCTS */}
        <h2 style={{ marginTop: "45px" }}>Products Management</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>Category</th>
              <th style={thStyle}>Price</th>
              <th style={thStyle}>Vendor</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => (
              <tr key={product._id}>
                <td style={tdStyle}>{product.name}</td>
                <td style={tdStyle}>{product.category || "Uncategorized"}</td>
                <td style={tdStyle}>₹{product.price}</td>
                <td style={tdStyle}>
                  {product.vendor?.name || "Unknown Vendor"}
                </td>
                <td style={tdStyle}>
                  <button onClick={() => deleteProduct(product._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* ORDERS */}
        <h2 style={{ marginTop: "45px" }}>Orders Management</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Buyer</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Platform Fee</th>
              <th style={thStyle}>Vendor Payout</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const orderFee =
                order.platformFee || Number(order.totalAmount || 0) * 0.05;

              const orderPayout =
                order.vendorPayout ||
                Number(order.totalAmount || 0) - orderFee;

              return (
                <tr key={order._id}>
                  <td style={tdStyle}>
                    {order.buyer?.name || "Unknown Buyer"}
                  </td>

                  <td style={tdStyle}>₹{order.totalAmount}</td>

                  <td style={tdStyle}>₹{orderFee.toFixed(2)}</td>

                  <td style={tdStyle}>₹{orderPayout.toFixed(2)}</td>

                  <td style={tdStyle}>
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order._id, e.target.value)
                      }
                    >
                      <option value="Processing">Processing</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>

                  <td style={tdStyle}>
                    <button onClick={() => deleteOrder(order._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* REVIEWS */}
        <h2 style={{ marginTop: "45px" }}>Reviews Management</h2>

        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Product</th>
              <th style={thStyle}>User</th>
              <th style={thStyle}>Rating</th>
              <th style={thStyle}>Comment</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {reviews.map((review) => (
              <tr key={review._id}>
                <td style={tdStyle}>
                  {review.product?.name || "Unknown Product"}
                </td>

                <td style={tdStyle}>{review.user?.name || "Unknown User"}</td>

                <td style={tdStyle}>⭐ {review.rating}</td>

                <td style={tdStyle}>{review.comment}</td>

                <td style={tdStyle}>
                  <button onClick={() => deleteReview(review._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default AdminDashboard;