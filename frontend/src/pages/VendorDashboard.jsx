import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function VendorDashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [products, setProducts] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalProductsSold: 0,
    totalSales: 0,
    totalPlatformFee: 0,
    totalVendorEarnings: 0,
    salesHistory: [],
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    image: "",
    stock: "",
  });

  const [editingProductId, setEditingProductId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVendorProducts();
    fetchVendorAnalytics();
  }, []);

  const fetchVendorProducts = async () => {
    try {
      const res = await API.get("/products");

      const allProducts = Array.isArray(res.data) ? res.data : [];

      const vendorProducts = allProducts.filter((product) => {
        const vendorId = product.vendor?._id || product.vendor;
        return (
          String(vendorId) === String(user?._id) ||
          product.vendor?.email === user?.email
        );
      });

      setProducts(vendorProducts);
    } catch (error) {
      console.log(error);
      alert("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorAnalytics = async () => {
    try {
      const res = await API.get("/orders/vendor/analytics");
      setAnalytics(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      image: "",
      stock: "",
    });

    setEditingProductId(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        image: formData.image,
        stock: Number(formData.stock),
      };

      if (editingProductId) {
        await API.put(`/products/${editingProductId}`, productData);
        alert("Product updated successfully");
      } else {
        await API.post("/products", productData);
        alert("Product added successfully");
      }

      resetForm();
      fetchVendorProducts();
      fetchVendorAnalytics();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setEditingProductId(product._id);

    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      image: product.image || "",
      stock: product.stock || "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(`/products/${productId}`);
      alert("Product deleted successfully");
      fetchVendorProducts();
      fetchVendorAnalytics();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Failed to delete product");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="vendor-dashboard-page">
      <div className="vendor-dashboard-container">
        <div className="vendor-dashboard-hero">
          <div>
            <p>Seller Workspace</p>
            <h1>Vendor Dashboard</h1>
            <span>
              Welcome, {user?.name || "Vendor"}. Manage your products, sales,
              earnings, and stock.
            </span>
          </div>

          <button onClick={logout}>Logout</button>
        </div>

        <div className="vendor-stats-grid">
          <div className="vendor-stat-card">
            <p>My Products</p>
            <h2>{products.length}</h2>
            <span>Products listed</span>
          </div>

          <div
            className="vendor-stat-card clickable-stat-card"
            onClick={() => navigate("/orders")}
            role="button"
            tabIndex="0"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate("/orders");
              }
            }}
          >
            <p>My Orders</p>
            <h2>{analytics.totalOrders || 0}</h2>
            <span>Orders received</span>
          </div>

          <div className="vendor-stat-card">
            <p>Total Sales</p>
            <h2>₹{Number(analytics.totalSales || 0).toFixed(2)}</h2>
            <span>Before commission</span>
          </div>

          <div className="vendor-stat-card">
            <p>Products Sold</p>
            <h2>{analytics.totalProductsSold || 0}</h2>
            <span>Total quantity sold</span>
          </div>

          <div className="vendor-stat-card">
            <p>Platform Fee</p>
            <h2>₹{Number(analytics.totalPlatformFee || 0).toFixed(2)}</h2>
            <span>5% commission</span>
          </div>

          <div className="vendor-stat-card">
            <p>My Earnings</p>
            <h2>₹{Number(analytics.totalVendorEarnings || 0).toFixed(2)}</h2>
            <span>After platform fee</span>
          </div>
        </div>

        <div className="vendor-form-card">
          <h2>{editingProductId ? "Update Product" : "Add New Product"}</h2>

          <form onSubmit={handleSubmit} className="vendor-product-form">
            <input
              type="text"
              name="name"
              placeholder="Product Name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
            />

            <input
              type="number"
              name="stock"
              placeholder="Stock Quantity"
              value={formData.stock}
              onChange={handleChange}
              required
            />

            <input
              type="text"
              name="image"
              placeholder="Image URL"
              value={formData.image}
              onChange={handleChange}
              required
            />

            <textarea
              name="description"
              placeholder="Product Description"
              value={formData.description}
              onChange={handleChange}
              required
            ></textarea>

            <div className="vendor-form-buttons">
              <button type="submit">
                {editingProductId ? "Update Product" : "Add Product"}
              </button>

              {editingProductId && (
                <button type="button" onClick={resetForm}>
                  Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="vendor-products-section">
          <h2>My Products</h2>

          {loading ? (
            <div className="vendor-empty-card">
              <h3>Loading products...</h3>
            </div>
          ) : products.length === 0 ? (
            <div className="vendor-empty-card">
              <h3>No products added yet.</h3>
              <p>Your listed products will appear here.</p>
            </div>
          ) : (
            <div className="vendor-products-grid">
              {products.map((product) => (
                <div key={product._id} className="vendor-product-card">
                  <img
                    src={product.image}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  <div className="vendor-product-content">
                    <h3>{product.name}</h3>
                    <p>{product.description}</p>

                    <div className="vendor-product-meta">
                      <span>₹{product.price}</span>

                      <span
                        className={
                          Number(product.stock || 0) > 0
                            ? "stock-good"
                            : "stock-empty"
                        }
                      >
                        Stock: {product.stock || 0}
                      </span>
                    </div>

                    <div className="vendor-product-actions">
                      <button onClick={() => handleEdit(product)}>Edit</button>
                      <button onClick={() => handleDelete(product._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          .vendor-dashboard-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.8), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            padding: clamp(14px, 2vw, 34px);
            box-sizing: border-box;
          }

          .vendor-dashboard-container {
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
          }

          .vendor-dashboard-hero {
            background: rgba(255, 250, 242, 0.96);
            border: 1px solid #c8a77a;
            border-radius: 24px;
            padding: clamp(24px, 2.5vw, 42px);
            margin-bottom: 24px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
          }

          .vendor-dashboard-hero p {
            margin: 0 0 6px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.7px;
          }

          .vendor-dashboard-hero h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(36px, 3vw, 58px);
          }

          .vendor-dashboard-hero span {
            display: block;
            margin-top: 8px;
            color: #5d4037;
            font-weight: 700;
          }

          .vendor-dashboard-hero button {
            background: linear-gradient(135deg, #8b1e1e, #5c0f0f);
            color: #fff8ef;
            border: 1px solid #d7b98a;
            border-radius: 30px;
            padding: 13px 28px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, serif;
            box-shadow: 0 6px 16px rgba(92, 15, 15, 0.28);
          }

          .vendor-stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
            gap: 18px;
            margin-bottom: 26px;
          }

          .vendor-stat-card {
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 20px;
            padding: 22px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .vendor-stat-card p {
            margin: 0 0 10px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-size: 13px;
          }

          .vendor-stat-card h2 {
            margin: 0;
            color: #3e2723;
            font-size: clamp(28px, 2.2vw, 42px);
            font-family: Georgia, serif;
          }

          .vendor-stat-card span {
            display: block;
            margin-top: 8px;
            color: #5d4037;
            font-weight: 700;
          }

          .clickable-stat-card {
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
          }

          .clickable-stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 12px 28px rgba(62, 39, 35, 0.22);
          }

          .vendor-form-card,
          .vendor-products-section {
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: clamp(22px, 2vw, 34px);
            margin-bottom: 26px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .vendor-form-card h2,
          .vendor-products-section h2 {
            margin: 0 0 20px;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(28px, 2vw, 42px);
          }

          .vendor-product-form {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 15px;
          }

          .vendor-product-form input,
          .vendor-product-form textarea {
            width: 100%;
            padding: 13px 14px;
            border-radius: 12px;
            border: 1px solid #c8a77a;
            background: #fffaf2;
            color: #3e2723;
            font-weight: 700;
            box-sizing: border-box;
          }

          .vendor-product-form textarea {
            grid-column: 1 / 3;
            min-height: 100px;
            resize: vertical;
          }

          .vendor-form-buttons {
            grid-column: 1 / 3;
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .vendor-form-buttons button {
            background: #7a4f2a;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 13px 24px;
            font-weight: 900;
            cursor: pointer;
          }

          .vendor-form-buttons button:nth-child(2) {
            background: #5d4037;
          }

          .vendor-products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 20px;
          }

          .vendor-product-card {
            background: #fff8ef;
            border: 1px solid #d7b98a;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 6px 16px rgba(62, 39, 35, 0.12);
          }

          .vendor-product-card img {
            width: 100%;
            height: 210px;
            object-fit: cover;
            background: #f5f5f5;
          }

          .vendor-product-content {
            padding: 18px;
          }

          .vendor-product-content h3 {
            margin: 0 0 8px;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: 23px;
          }

          .vendor-product-content p {
            color: #5d4037;
            font-weight: 700;
            line-height: 1.5;
          }

          .vendor-product-meta {
            display: flex;
            justify-content: space-between;
            gap: 10px;
            flex-wrap: wrap;
            margin: 16px 0;
          }

          .vendor-product-meta span {
            background: #fff1d8;
            border: 1px solid #d7b98a;
            padding: 8px 12px;
            border-radius: 30px;
            color: #3e2723;
            font-weight: 900;
          }

          .stock-good {
            color: #2e7d32 !important;
          }

          .stock-empty {
            color: #b71c1c !important;
          }

          .vendor-product-actions {
            display: flex;
            gap: 10px;
          }

          .vendor-product-actions button {
            flex: 1;
            border: none;
            padding: 11px 14px;
            border-radius: 30px;
            font-weight: 900;
            cursor: pointer;
          }

          .vendor-product-actions button:first-child {
            background: #7a4f2a;
            color: white;
          }

          .vendor-product-actions button:last-child {
            background: #8b1e1e;
            color: white;
          }

          .vendor-empty-card {
            background: #fff8ef;
            border: 1px solid #d7b98a;
            border-radius: 16px;
            padding: 24px;
            color: #3e2723;
          }

          @media (max-width: 700px) {
            .vendor-dashboard-hero {
              flex-direction: column;
              align-items: flex-start;
            }

            .vendor-dashboard-hero button {
              width: 100%;
            }

            .vendor-product-form {
              grid-template-columns: 1fr;
            }

            .vendor-product-form textarea,
            .vendor-form-buttons {
              grid-column: 1;
            }

            .vendor-form-buttons button {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
}

export default VendorDashboard;