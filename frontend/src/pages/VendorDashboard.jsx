import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function VendorDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stockInputs, setStockInputs] = useState({});
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalProductsSold: 0,
    totalSales: 0,
    totalPlatformFee: 0,
    totalVendorEarnings: 0,
    salesHistory: [],
  });
  const [toast, setToast] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    stock: "",
  });

  const categories = [
    "Handmade Decor",
    "Pottery & Ceramics",
    "Handcrafted Jewelry",
    "Textiles & Clothing",
    "Home & Living",
    "Paintings & Artwork",
  ];

  useEffect(() => {
    fetchVendorData();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 1800);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const fetchVendorData = async () => {
    try {
      const productsRes = await API.get("/products");
      const ordersRes = await API.get("/orders");

      const myProducts = productsRes.data.filter((product) => {
        return product.vendor?._id === user?._id || product.vendor === user?._id;
      });

      const myOrders = ordersRes.data.filter((order) =>
        order.products?.some((item) => {
          return (
            item.vendor?._id === user?._id ||
            item.vendor === user?._id ||
            item.product?.vendor?._id === user?._id ||
            item.product?.vendor === user?._id
          );
        })
      );

      const stockData = {};
      myProducts.forEach((product) => {
        stockData[product._id] = Number(product.stock || 0);
      });

      setProducts(myProducts);
      setOrders(myOrders);
      setStockInputs(stockData);

      try {
        const analyticsRes = await API.get("/orders/vendor/analytics");
        setAnalytics(analyticsRes.data);
      } catch (error) {
        calculateLocalAnalytics(myOrders);
      }
    } catch (error) {
      console.log(error);
      showToast("Failed to load vendor dashboard", "error");
    }
  };

  const calculateLocalAnalytics = (myOrders) => {
    let totalSales = 0;
    let totalPlatformFee = 0;
    let totalVendorEarnings = 0;
    let totalProductsSold = 0;
    const salesHistory = [];

    myOrders.forEach((order) => {
      order.products?.forEach((item) => {
        const productVendorId =
          item.vendor?._id ||
          item.vendor ||
          item.product?.vendor?._id ||
          item.product?.vendor;

        if (String(productVendorId) === String(user?._id)) {
          const quantity = Number(item.quantity || 1);
          const price = Number(item.price || item.product?.price || 0);
          const itemTotal = price * quantity;
          const platformFee = item.platformFee || itemTotal * 0.05;
          const vendorPayout = item.vendorPayout || itemTotal * 0.95;

          totalSales += itemTotal;
          totalPlatformFee += platformFee;
          totalVendorEarnings += vendorPayout;
          totalProductsSold += quantity;

          salesHistory.push({
            productName: item.product?.name || "Product",
            quantity,
            price,
            itemTotal,
            platformFee,
            vendorPayout,
            buyerName: order.buyer?.name || "Buyer",
            status: order.status,
            date: order.createdAt,
          });
        }
      });
    });

    setAnalytics({
      totalOrders: myOrders.length,
      totalProductsSold,
      totalSales,
      totalPlatformFee,
      totalVendorEarnings,
      salesHistory,
    });
  };

  const addProduct = async (e) => {
    e.preventDefault();

    if (!user || user.role !== "vendor") {
      showToast("Only vendors can add products", "error");
      return;
    }

    try {
      await API.post("/products", {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        vendor: user._id,
      });

      showToast("Product added successfully");

      setFormData({
        name: "",
        description: "",
        price: "",
        category: "",
        image: "",
        stock: "",
      });

      fetchVendorData();
    } catch (error) {
      console.log(error);
      showToast("Failed to add product", "error");
    }
  };

  const updateStock = async (productId) => {
    try {
      await API.put(`/products/${productId}`, {
        stock: Number(stockInputs[productId] || 0),
      });

      showToast("Stock updated successfully");
      fetchVendorData();
    } catch (error) {
      console.log(error);
      showToast("Failed to update stock", "error");
    }
  };

  const deleteProduct = async (product) => {
    const productVendorId = product.vendor?._id || product.vendor;

    if (productVendorId !== user?._id) {
      showToast("You cannot delete another vendor's product", "error");
      return;
    }

    if (!window.confirm("Delete this product?")) return;

    try {
      await API.delete(`/products/${product._id}`);
      showToast("Product deleted successfully", "warning");
      fetchVendorData();
    } catch (error) {
      console.log(error);
      showToast("Failed to delete product", "error");
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

  const maxSale =
    analytics.salesHistory.length > 0
      ? Math.max(...analytics.salesHistory.map((sale) => sale.itemTotal || 0))
      : 1;

  return (
    <div className="vendor-page">
      {toast && (
        <div
          className={
            toast.type === "error"
              ? "vendor-toast error"
              : toast.type === "warning"
              ? "vendor-toast warning"
              : "vendor-toast success"
          }
        >
          {toast.message}
        </div>
      )}

      <div className="vendor-hero">
        <div>
          <p>Seller Workspace</p>
          <h1>Vendor Dashboard</h1>
          <span>
            Welcome, <strong>{user?.name}</strong>. Manage your products, sales,
            earnings, and stock.
          </span>
        </div>

        <button onClick={logout} className="vendor-logout-btn">
          Logout
        </button>
      </div>

      <div className="vendor-stats-grid">
        <div className="vendor-stat-card">
          <p>My Products</p>
          <h2>{products.length}</h2>
          <span>Products listed</span>
        </div>

        <div className="vendor-stat-card">
          <p>My Orders</p>
          <h2>{analytics.totalOrders}</h2>
          <span>Orders received</span>
        </div>

        <div className="vendor-stat-card dark">
          <p>Total Sales</p>
          <h2>₹{Number(analytics.totalSales || 0).toFixed(2)}</h2>
          <span>Before commission</span>
        </div>

        <div className="vendor-stat-card">
          <p>Products Sold</p>
          <h2>{analytics.totalProductsSold}</h2>
          <span>Total quantity sold</span>
        </div>

        <div className="vendor-stat-card fee">
          <p>Platform Fee</p>
          <h2>₹{Number(analytics.totalPlatformFee || 0).toFixed(2)}</h2>
          <span>5% commission</span>
        </div>

        <div className="vendor-stat-card earnings">
          <p>My Earnings</p>
          <h2>₹{Number(analytics.totalVendorEarnings || 0).toFixed(2)}</h2>
          <span>After platform fee</span>
        </div>
      </div>

      <div className="vendor-main-grid">
        <section className="vendor-card">
          <div className="vendor-section-title">
            <p>Product Management</p>
            <h2>Add New Product</h2>
          </div>

          <form onSubmit={addProduct} className="vendor-form">
            <input
              type="text"
              placeholder="Product name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Price"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />

            <input
              type="number"
              placeholder="Stock quantity"
              min="0"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: e.target.value })
              }
              required
            />

            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Image URL"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              required
            />

            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />

            <button type="submit">Add Product</button>
          </form>
        </section>

        <section className="vendor-card">
          <div className="vendor-section-title">
            <p>Sales Analytics</p>
            <h2>Sales History</h2>
          </div>

          {analytics.salesHistory.length === 0 ? (
            <div className="vendor-empty-box">
              <h3>No sales yet.</h3>
              <p>Orders for your products will appear here.</p>
            </div>
          ) : (
            <div className="sales-history-list">
              {analytics.salesHistory.slice(0, 6).map((sale, index) => (
                <div key={index} className="sales-history-item">
                  <div>
                    <h3>{sale.productName}</h3>
                    <p>
                      {formatDate(sale.date)} • Qty {sale.quantity} •{" "}
                      {sale.status}
                    </p>
                  </div>

                  <div className="sales-bar-box">
                    <div
                      className="sales-bar"
                      style={{
                        width: `${Math.max(
                          (Number(sale.itemTotal || 0) / maxSale) * 100,
                          8
                        )}%`,
                      }}
                    ></div>
                  </div>

                  <strong>₹{Number(sale.vendorPayout || 0).toFixed(2)}</strong>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="vendor-card products-section">
        <div className="vendor-section-title">
          <p>Inventory</p>
          <h2>My Products</h2>
        </div>

        {products.length === 0 ? (
          <div className="vendor-empty-box">
            <h3>You have not added any products yet.</h3>
            <p>Add your first handmade product using the form above.</p>
          </div>
        ) : (
          <div className="vendor-products-grid">
            {products.map((product) => (
              <div key={product._id} className="vendor-product-card">
                {product.image && <img src={product.image} alt={product.name} />}

                <h3>{product.name}</h3>

                <p>{product.description}</p>

                <span>{product.category || "Uncategorized"}</span>

                <h2>₹{product.price}</h2>

                <div className="vendor-stock-box">
                  <p
                    className={
                      Number(product.stock || 0) > 0
                        ? "stock-status-green"
                        : "stock-status-red"
                    }
                  >
                    {Number(product.stock || 0) > 0
                      ? `In Stock: ${product.stock}`
                      : "Out of Stock"}
                  </p>

                  <input
                    type="number"
                    min="0"
                    value={stockInputs[product._id] ?? 0}
                    onChange={(e) =>
                      setStockInputs({
                        ...stockInputs,
                        [product._id]: e.target.value,
                      })
                    }
                  />

                  <button
                    type="button"
                    className="update-stock-btn"
                    onClick={() => updateStock(product._id)}
                  >
                    Update Stock
                  </button>
                </div>

                <button onClick={() => deleteProduct(product)}>
                  Delete Product
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <style>
        {`
          .vendor-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.8), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            padding: clamp(14px, 2vw, 34px);
            box-sizing: border-box;
          }

          .vendor-hero,
          .vendor-card,
          .vendor-stat-card {
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .vendor-hero {
            border-radius: 24px;
            padding: clamp(24px, 3vw, 46px);
            margin-bottom: 24px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 22px;
            flex-wrap: wrap;
          }

          .vendor-hero p,
          .vendor-section-title p,
          .vendor-stat-card p {
            margin: 0 0 8px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }

          .vendor-hero h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(42px, 4vw, 72px);
          }

          .vendor-hero span {
            display: block;
            margin-top: 10px;
            color: #5d4037;
            font-size: 18px;
            font-weight: 700;
          }

          .vendor-logout-btn {
            background: linear-gradient(135deg, #8b1e1e, #5c0f0f);
            color: #fff8ef;
            border: 1px solid #d7b98a;
            border-radius: 40px;
            padding: 14px 30px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, serif;
            font-size: 16px;
            box-shadow: 0 6px 16px rgba(92, 15, 15, 0.28);
          }

          .vendor-logout-btn:hover {
            background: linear-gradient(135deg, #a32626, #6e1414);
            transform: translateY(-2px);
          }

          .vendor-stats-grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 18px;
            margin-bottom: 24px;
          }

          .vendor-stat-card {
            border-radius: 20px;
            padding: 22px;
          }

          .vendor-stat-card h2 {
            margin: 0;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: clamp(28px, 2.4vw, 44px);
          }

          .vendor-stat-card span {
            display: block;
            color: #5d4037;
            font-weight: 700;
            margin-top: 6px;
          }

          .vendor-stat-card.dark {
            background: linear-gradient(135deg, #3e2723, #6d4c41);
          }

          .vendor-stat-card.dark p,
          .vendor-stat-card.dark h2,
          .vendor-stat-card.dark span {
            color: #fff8ef;
          }

          .vendor-stat-card.fee {
            background: linear-gradient(135deg, #fff1d8, #ffe2a8);
          }

          .vendor-stat-card.earnings {
            background: linear-gradient(135deg, #e8f5e9, #c8e6c9);
            border-color: #81c784;
          }

          .vendor-main-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 0.85fr);
            gap: 24px;
            margin-bottom: 24px;
          }

          .vendor-card {
            border-radius: 24px;
            padding: clamp(22px, 2.5vw, 36px);
          }

          .vendor-section-title {
            margin-bottom: 22px;
            border-bottom: 2px solid #d7b98a;
            padding-bottom: 16px;
          }

          .vendor-section-title h2 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(30px, 2.5vw, 46px);
          }

          .vendor-form {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .vendor-form input,
          .vendor-form select,
          .vendor-form textarea {
            width: 100%;
            padding: 15px;
            border-radius: 12px;
            border: 1px solid #c8a77a;
            background: #fffaf2;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 15px;
            box-sizing: border-box;
            outline: none;
          }

          .vendor-form textarea {
            grid-column: 1 / 3;
            min-height: 120px;
            resize: vertical;
          }

          .vendor-form input:focus,
          .vendor-form select:focus,
          .vendor-form textarea:focus {
            border-color: #7a4f2a;
            box-shadow: 0 0 0 3px rgba(122, 79, 42, 0.16);
          }

          .vendor-form button {
            grid-column: 1 / 3;
            background: #7a4f2a;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 15px 24px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, serif;
            font-size: 16px;
          }

          .vendor-form button:hover {
            background: #5c371d;
          }

          .vendor-empty-box {
            background: #fff8ef;
            border: 1px dashed #c8a77a;
            border-radius: 18px;
            padding: 28px;
            color: #5d4037;
          }

          .vendor-empty-box h3 {
            margin-top: 0;
            color: #3e2723;
            font-family: Georgia, serif;
          }

          .sales-history-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .sales-history-item {
            background: #fff8ef;
            border: 1px solid #ead7bd;
            border-radius: 16px;
            padding: 16px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) 120px 100px;
            align-items: center;
            gap: 14px;
          }

          .sales-history-item h3 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
          }

          .sales-history-item p {
            margin: 6px 0 0;
            color: #5d4037;
            font-weight: 700;
            font-size: 14px;
          }

          .sales-history-item strong {
            color: #2e7d32;
            font-family: "Segoe UI", Arial, sans-serif;
            text-align: right;
          }

          .sales-bar-box {
            width: 120px;
            height: 10px;
            background: #ead7bd;
            border-radius: 20px;
            overflow: hidden;
          }

          .sales-bar {
            height: 100%;
            background: #7a4f2a;
            border-radius: 20px;
          }

          .products-section {
            margin-bottom: 20px;
          }

          .vendor-products-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 22px;
          }

          .vendor-product-card {
            background: #fff8ef;
            border: 1px solid #d7b98a;
            border-radius: 20px;
            padding: 18px;
            box-shadow: 0 6px 16px rgba(62, 39, 35, 0.1);
          }

          .vendor-product-card img {
            width: 100%;
            height: 220px;
            object-fit: cover;
            border-radius: 14px;
            border: 1px solid #ead7bd;
            margin-bottom: 14px;
          }

          .vendor-product-card h3 {
            margin: 0 0 8px;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: 24px;
          }

          .vendor-product-card p {
            color: #5d4037;
            line-height: 1.5;
            font-weight: 700;
          }

          .vendor-product-card span {
            display: inline-block;
            background: #fff1d8;
            border: 1px solid #c8a77a;
            color: #3e2723;
            padding: 7px 13px;
            border-radius: 30px;
            font-weight: 900;
          }

          .vendor-product-card h2 {
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
          }

          .vendor-product-card button {
            width: 100%;
            background: #b71c1c;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 12px 18px;
            font-weight: 900;
            cursor: pointer;
          }

          .vendor-stock-box {
            margin: 14px 0;
            background: #fffaf2;
            border: 1px solid #d7b98a;
            border-radius: 14px;
            padding: 14px;
          }

          .stock-status-green {
            color: #2e7d32 !important;
            font-weight: 900 !important;
            margin: 0 0 10px !important;
          }

          .stock-status-red {
            color: #b71c1c !important;
            font-weight: 900 !important;
            margin: 0 0 10px !important;
          }

          .vendor-stock-box input {
            width: 100%;
            padding: 11px;
            border-radius: 10px;
            border: 1px solid #c8a77a;
            margin-bottom: 10px;
            box-sizing: border-box;
          }

          .update-stock-btn {
            background: #2e7d32 !important;
            margin-bottom: 10px;
          }

          .vendor-toast {
            position: fixed;
            top: 110px;
            right: 25px;
            color: white;
            padding: 14px 22px;
            border-radius: 12px;
            z-index: 7000;
            font-weight: 800;
            box-shadow: 0 5px 18px rgba(0,0,0,0.25);
          }

          .vendor-toast.success {
            background: #2e7d32;
          }

          .vendor-toast.warning {
            background: #ef6c00;
          }

          .vendor-toast.error {
            background: #b71c1c;
          }

          @media (max-width: 1250px) {
            .vendor-stats-grid {
              grid-template-columns: repeat(3, 1fr);
            }

            .vendor-main-grid {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 750px) {
            .vendor-stats-grid {
              grid-template-columns: repeat(2, 1fr);
            }

            .vendor-form {
              grid-template-columns: 1fr;
            }

            .vendor-form textarea,
            .vendor-form button {
              grid-column: 1;
            }

            .sales-history-item {
              grid-template-columns: 1fr;
            }

            .sales-bar-box {
              width: 100%;
            }

            .sales-history-item strong {
              text-align: left;
            }
          }

          @media (max-width: 600px) {
            .vendor-logout-btn {
              width: 100%;
            }
          }

          @media (max-width: 480px) {
            .vendor-page {
              padding: 10px;
            }

            .vendor-stats-grid {
              grid-template-columns: 1fr;
            }

            .vendor-hero,
            .vendor-card {
              border-radius: 18px;
              padding: 20px;
            }

            .vendor-hero h1 {
              font-size: 34px;
            }

            .vendor-toast {
              top: 100px;
              left: 12px;
              right: 12px;
              text-align: center;
            }
          }
        `}
      </style>
    </div>
  );
}

export default VendorDashboard;
