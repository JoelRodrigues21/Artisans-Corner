import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiShoppingCart } from "react-icons/hi2";

function Wishlist() {
  const navigate = useNavigate();
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const savedWishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    setWishlist(savedWishlist);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 1800);
  };

  const updateWishlist = (updatedWishlist) => {
    setWishlist(updatedWishlist);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const clearWishlist = () => {
    if (!window.confirm("Clear wishlist?")) return;
    localStorage.removeItem("wishlist");
    setWishlist([]);
    showToast("Wishlist cleared", "warning");
  };

  const removeFromWishlist = (e, productId) => {
    e.stopPropagation();

    const updatedWishlist = wishlist.filter((item) => item._id !== productId);
    updateWishlist(updatedWishlist);
    showToast("Product removed from wishlist", "warning");
  };

  const addToCart = (e, product) => {
    e.stopPropagation();

    const stockCount = Number(product.stock ?? 9999);

    if (stockCount <= 0) {
      showToast("This product is out of stock", "error");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      if (Number(existingItem.quantity || 1) >= stockCount) {
        showToast(`Only ${stockCount} item(s) available`, "warning");
        return;
      }

      existingItem.quantity += 1;
      showToast("Cart quantity updated");
    } else {
      cart.push({ ...product, quantity: 1 });
      showToast("Product added to cart");
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  };

  return (
    <div className="wishlist-page">
      {toast && (
        <div
          className={
            toast.type === "error"
              ? "page-toast error"
              : toast.type === "warning"
              ? "page-toast warning"
              : "page-toast success"
          }
        >
          {toast.message}
        </div>
      )}

      <div className="wishlist-container">
        <div className="wishlist-header">
          <div>
            <p>Saved Collection</p>
            <h1>My Wishlist</h1>
            {wishlist.length > 0 && (
              <span>{wishlist.length} product(s) in your wishlist</span>
            )}
          </div>

          {wishlist.length > 0 && (
            <button onClick={clearWishlist}>Clear Wishlist</button>
          )}
        </div>

        {wishlist.length === 0 ? (
          <div className="wishlist-empty-box">
            <h2>Your wishlist is empty.</h2>
            <p>Add products to wishlist by clicking the heart button.</p>
            <button onClick={() => navigate("/")}>Continue Shopping</button>
          </div>
        ) : (
          <div className="wishlist-list">
            {wishlist.map((product) => {
              const stockCount = Number(product.stock ?? 9999);
              const isOutOfStock = stockCount <= 0;

              return (
                <div
                  key={product._id}
                  className="wishlist-product-row"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="wishlist-image-box">
                    {imageErrors[product._id] ? (
                      <div className="wishlist-img-placeholder">
                        No Image
                      </div>
                    ) : (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="wishlist-product-img"
                        onError={() =>
                          setImageErrors({
                            ...imageErrors,
                            [product._id]: true,
                          })
                        }
                      />
                    )}
                  </div>

                  <div className="wishlist-product-info">
                    <div className="wishlist-product-topline">
                      <h2>{product.name}</h2>

                      <button
                        onClick={(e) => removeFromWishlist(e, product._id)}
                        className="wishlist-heart-btn"
                        title="Remove from Wishlist"
                      >
                        ♥
                      </button>
                    </div>

                    <p>
                      {product.description?.length > 150
                        ? product.description.slice(0, 150) + "..."
                        : product.description}
                    </p>

                    <div className="wishlist-meta-row">
                      <span>{product.category || "Handmade Product"}</span>

                      <span
                        className={
                          isOutOfStock
                            ? "wishlist-stock-red"
                            : "wishlist-stock-green"
                        }
                      >
                        {isOutOfStock
                          ? "Out of Stock"
                          : product.stock !== undefined
                          ? `In Stock: ${stockCount}`
                          : "In Stock"}
                      </span>
                    </div>

                    <h3>₹{product.price}</h3>

                    <div className="wishlist-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/product/${product._id}`);
                        }}
                      >
                        View Product
                      </button>

                      <button
                        onClick={(e) => addToCart(e, product)}
                        disabled={isOutOfStock}
                        className={isOutOfStock ? "disabled-cart-btn" : ""}
                      >
                        <HiShoppingCart size={18} />
                        {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </div>

                  <div className="wishlist-side-price">
                    <p>Wishlisted</p>
                    <h2>₹{product.price}</h2>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>
        {`
          .wishlist-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.8), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            padding: clamp(10px, 2vw, 32px);
            box-sizing: border-box;
          }

          .wishlist-container {
            width: 100%;
            max-width: none;
            margin: 0;
          }

          .wishlist-header {
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: clamp(22px, 2.5vw, 40px);
            margin-bottom: 24px;
            box-shadow: 0 8px 22px rgba(62,39,35,0.14);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;
            flex-wrap: wrap;
          }

          .wishlist-header p {
            margin: 0 0 6px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }

          .wishlist-header h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(36px, 3vw, 58px);
          }

          .wishlist-header span {
            display: block;
            margin-top: 8px;
            color: #5d4037;
            font-weight: 800;
          }

          .wishlist-header button,
          .wishlist-empty-box button,
          .wishlist-actions button {
            background: #7a4f2a;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 12px 22px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, serif;
          }

          .wishlist-header button {
            background: #b71c1c;
          }

          .wishlist-empty-box {
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 18px;
            padding: 34px;
            box-shadow: 0 8px 22px rgba(62,39,35,0.14);
          }

          .wishlist-empty-box h2 {
            color: #3e2723;
            font-family: Georgia, serif;
          }

          .wishlist-empty-box p {
            color: #5d4037;
            font-weight: 700;
          }

          .wishlist-list {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .wishlist-product-row {
            width: 100%;
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-left: 6px solid #7a4f2a;
            border-radius: 20px;
            padding: clamp(14px, 2vw, 22px);
            display: grid;
            grid-template-columns: clamp(105px, 12vw, 170px) minmax(0, 1fr) clamp(130px, 14vw, 190px);
            gap: clamp(14px, 2vw, 24px);
            align-items: center;
            cursor: pointer;
            box-shadow: 0 7px 18px rgba(62,39,35,0.12);
            transition: 0.25s ease;
            box-sizing: border-box;
          }

          .wishlist-product-row:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 26px rgba(62,39,35,0.18);
          }

          .wishlist-image-box {
            width: clamp(105px, 12vw, 170px);
            height: clamp(100px, 10vw, 145px);
            border-radius: 14px;
            overflow: hidden;
            border: 1px solid #d7b98a;
            background: #fff1d8;
          }

          .wishlist-product-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            display: block;
          }

          .wishlist-img-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #7a5c44;
            font-weight: 900;
            font-family: Georgia, serif;
            text-align: center;
            padding: 10px;
            box-sizing: border-box;
          }

          .wishlist-product-info {
            min-width: 0;
          }

          .wishlist-product-topline {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 12px;
          }

          .wishlist-product-info h2 {
            margin: 0 0 8px;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(20px, 1.6vw, 30px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .wishlist-product-info p {
            margin: 0 0 12px;
            color: #5d4037;
            font-weight: 700;
            line-height: 1.5;
          }

          .wishlist-meta-row {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 12px;
          }

          .wishlist-meta-row span {
            background: #fff1d8;
            color: #3e2723;
            border: 1px solid #c8a77a;
            padding: 7px 12px;
            border-radius: 30px;
            font-weight: 900;
            font-size: 13px;
          }

          .wishlist-stock-green {
            background: #e8f5e9 !important;
            color: #2e7d32 !important;
            border-color: #81c784 !important;
          }

          .wishlist-stock-red {
            background: #ffebee !important;
            color: #b71c1c !important;
            border-color: #ef9a9a !important;
          }

          .wishlist-product-info h3 {
            margin: 0 0 14px;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: clamp(22px, 1.6vw, 32px);
          }

          .wishlist-actions {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .wishlist-actions button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 7px;
          }

          .wishlist-actions button:last-child {
            background: #3e2723;
          }

          .wishlist-actions button:disabled,
          .disabled-cart-btn {
            background: #bdbdbd !important;
            cursor: not-allowed !important;
            box-shadow: none !important;
          }

          .wishlist-heart-btn {
            background: #fff8ef;
            color: #d32f2f;
            border: 1px solid #d32f2f;
            width: 42px;
            height: 42px;
            min-width: 42px;
            border-radius: 50%;
            font-size: 23px;
            padding: 0;
            cursor: pointer;
            line-height: 1;
          }

          .wishlist-heart-btn:hover {
            background: #ffe8e8;
          }

          .wishlist-side-price {
            text-align: right;
          }

          .wishlist-side-price p {
            margin: 0 0 8px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 13px;
          }

          .wishlist-side-price h2 {
            margin: 0;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: clamp(24px, 1.8vw, 36px);
          }

          @media (max-width: 900px) {
            .wishlist-product-row {
              grid-template-columns: 125px minmax(0, 1fr);
            }

            .wishlist-image-box {
              width: 125px;
              height: 120px;
            }

            .wishlist-side-price {
              grid-column: 1 / 3;
              text-align: left;
              border-top: 1px solid #ead7bd;
              padding-top: 14px;
            }
          }

          @media (max-width: 600px) {
            .wishlist-header {
              align-items: flex-start;
            }

            .wishlist-header button {
              width: 100%;
            }

            .wishlist-product-row {
              grid-template-columns: 92px minmax(0, 1fr);
              padding: 12px;
              border-radius: 16px;
              gap: 12px;
            }

            .wishlist-image-box {
              width: 92px;
              height: 92px;
              border-radius: 12px;
            }

            .wishlist-product-info h2 {
              font-size: 17px;
              white-space: normal;
              display: -webkit-box;
              -webkit-line-clamp: 2;
              -webkit-box-orient: vertical;
            }

            .wishlist-product-info p {
              display: none;
            }

            .wishlist-product-info h3 {
              font-size: 18px;
              margin-bottom: 10px;
            }

            .wishlist-meta-row {
              gap: 6px;
              margin-bottom: 10px;
            }

            .wishlist-meta-row span {
              font-size: 11px;
              padding: 5px 9px;
            }

            .wishlist-heart-btn {
              width: 36px;
              height: 36px;
              min-width: 36px;
              font-size: 20px;
            }

            .wishlist-actions {
              gap: 8px;
            }

            .wishlist-actions button {
              flex: 1;
              min-width: 120px;
              padding: 10px 12px;
              font-size: 13px;
            }

            .wishlist-side-price {
              grid-column: 1 / 3;
            }
          }

          @media (max-width: 420px) {
            .wishlist-product-row {
              grid-template-columns: 1fr;
            }

            .wishlist-image-box {
              width: 100%;
              height: 180px;
            }

            .wishlist-product-topline {
              align-items: center;
            }

            .wishlist-actions {
              flex-direction: column;
            }

            .wishlist-actions button {
              width: 100%;
              flex: unset;
            }

            .wishlist-side-price {
              grid-column: auto;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Wishlist;