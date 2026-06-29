import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [toast, setToast] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const user = JSON.parse(localStorage.getItem("user"));
  const isVendor = user?.role === "vendor";
  const canShop = !isVendor;
  const canWriteReview = user?.role === "buyer" || user?.role === "admin";

  useEffect(() => {
    fetchProduct();
    fetchReviews();
    checkWishlist();
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 1800);
  };

  const fetchProduct = async () => {
    try {
      const res = await API.get(`/products/${id}`);
      setProduct(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${id}`);
      setReviews(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      try {
        const res = await API.get("/reviews");
        const allReviews = Array.isArray(res.data) ? res.data : [];

        const productReviews = allReviews.filter(
          (review) =>
            review.product?._id === id ||
            review.product === id ||
            review.productId === id
        );

        setReviews(productReviews);
      } catch (err) {
        setReviews([]);
      }
    }
  };

  const checkWishlist = () => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = wishlist.some((item) => item._id === id);
    setIsWishlisted(exists);
  };

  const increaseQuantity = () => {
    setQuantity((prevQuantity) => {
      const availableStock = Number(product?.stock || 0);

      if (availableStock > 0 && prevQuantity >= availableStock) {
        showToast(`Only ${availableStock} item(s) available`, "warning");
        return prevQuantity;
      }

      return prevQuantity + 1;
    });
  };

  const decreaseQuantity = () => {
    setQuantity((prevQuantity) => Math.max(prevQuantity - 1, 1));
  };

  const addToCart = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "buyer" && user.role !== "admin") {
      showToast("Only buyers can add products to cart", "error");
      return;
    }

    if (Number(product.stock || 0) <= 0) {
      showToast("This product is out of stock", "error");
      return;
    }

    if (quantity > Number(product.stock || 0)) {
      showToast(`Only ${product.stock} item(s) available`, "error");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const existingItem = cart.find((item) => item._id === product._id);

    if (existingItem) {
      const newQuantity = Number(existingItem.quantity || 1) + quantity;

      if (newQuantity > Number(product.stock || 0)) {
        showToast(`Only ${product.stock} item(s) available`, "warning");
        return;
      }

      existingItem.quantity = newQuantity;
      showToast(`Cart quantity updated by ${quantity}`);
    } else {
      cart.push({
        ...product,
        quantity: quantity,
      });

      showToast(`${quantity} product(s) added to cart`);
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const toggleWishlist = () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "buyer" && user.role !== "admin") {
      showToast("Only buyers can use wishlist", "error");
      return;
    }

    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const alreadyExists = wishlist.some((item) => item._id === product._id);

    let updatedWishlist;

    if (alreadyExists) {
      updatedWishlist = wishlist.filter((item) => item._id !== product._id);
      setIsWishlisted(false);
      showToast("Product removed from wishlist", "warning");
    } else {
      updatedWishlist = [...wishlist, product];
      setIsWishlisted(true);
      showToast("Product added to wishlist");
    }

    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
  };

  const submitReview = async (e) => {
    e.preventDefault();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!canWriteReview) {
      showToast("Only buyers can write reviews", "error");
      return;
    }

    if (!comment.trim()) {
      showToast("Please write your review", "error");
      return;
    }

    try {
      await API.post("/reviews", {
        product: id,
        productId: id,
        user: user._id,
        rating,
        comment,
      });

      setComment("");
      setRating(5);
      showToast("Review submitted successfully");
      fetchReviews();
    } catch (error) {
      showToast("Failed to submit review", "error");
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
          reviews.length
        ).toFixed(1)
      : null;

  const ratingLabel = averageRating ? `${averageRating} ★ Rating` : "No reviews yet";
  const stockCount = Number(product?.stock || 0);
  const isOutOfStock = stockCount <= 0;

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="product-loading-card">
          <h2>Loading product...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      {toast && (
        <div
          className={
            toast.type === "error"
              ? "product-toast error"
              : toast.type === "warning"
              ? "product-toast warning"
              : "product-toast success"
          }
        >
          {toast.message}
        </div>
      )}

      <div className="product-detail-container">
        <section className="product-detail-hero">
          <div className="product-image-panel">
            <img src={product.image} alt={product.name} />

            {canShop && (
              <button
                onClick={toggleWishlist}
                className={
                  isWishlisted
                    ? "detail-wishlist-btn active"
                    : "detail-wishlist-btn"
                }
              >
                {isWishlisted ? "♥" : "♡"}
              </button>
            )}
          </div>

          <div className="product-info-panel">
            <p className="product-small-title">Handmade Product</p>

            <h1>{product.name}</h1>

            <div className="product-badges">
              <span>{product.category || "Handmade"}</span>

              <span className={isOutOfStock ? "stock-badge-red" : "stock-badge-green"}>
                {isOutOfStock ? "Out of Stock" : `In Stock: ${stockCount}`}
              </span>

              <span>{ratingLabel}</span>
            </div>

            <p className="product-description">{product.description}</p>

            <h2>₹{product.price}</h2>

            <div className="vendor-box">
              <span>Vendor</span>
              <strong>
                {product.vendor?.name || product.vendorName || "Local Artisan"}
              </strong>
            </div>

            <div className="craft-note">
              Carefully handcrafted by skilled artisans using traditional
              techniques and premium materials.
            </div>

            {canShop && (
              <div className="product-purchase-section">
                <div className="detail-quantity-control">
                  <button type="button" onClick={decreaseQuantity}>
                    −
                  </button>

                  <span>{quantity}</span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={quantity >= stockCount || isOutOfStock}
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={addToCart}
                  className="detail-add-cart-btn"
                  disabled={isOutOfStock}
                >
                  {isOutOfStock ? "Out of Stock" : "Add To Cart"}
                </button>

                <button onClick={toggleWishlist} className="wishlist-action-btn">
                  {isWishlisted ? "Remove Wishlist" : "Add To Wishlist"}
                </button>
              </div>
            )}
          </div>
        </section>

        <section className="review-redesign-section">
          <div className="review-redesign-header">
            <div>
              <p>Customer Voice</p>
              <h2>Customer Reviews</h2>
              <span>
                See what buyers think and share your own experience about this
                handmade product.
              </span>
            </div>
          </div>

          <div className="review-stats-row">
            <div className="review-stat-card dark">
              <p>Overall Rating</p>

              {reviews.length === 0 ? (
                <>
                  <h1>No Reviews</h1>
                  <span>Ratings will appear after customers review.</span>
                </>
              ) : (
                <>
                  <h1>{averageRating}</h1>
                  <div>★★★★★</div>
                  <span>Out of 5</span>
                </>
              )}
            </div>

            <div className="review-stat-card">
              <p>Total Reviews</p>
              <h1>{reviews.length}</h1>
              <span>
                {reviews.length === 0
                  ? "No reviews yet"
                  : "Customer reviews received"}
              </span>
            </div>

            <div className="review-stat-card">
              <p>Product Quality</p>
              <h1>Handmade</h1>
              <span>Crafted by skilled artisans</span>
            </div>
          </div>

          <div className="review-main-grid">
            <div className="review-list-panel">
              <div className="review-panel-title">
                <p>Buyer Feedback</p>
                <h3>Reviews from Customers</h3>
              </div>

              {reviews.length === 0 ? (
                <div className="review-empty-box">
                  <div className="review-empty-icon">★</div>
                  <h3>No reviews yet</h3>
                  <p>
                    Be the first buyer to share your experience about this
                    handmade product.
                  </p>
                </div>
              ) : (
                <div className="review-list">
                  {reviews.map((review) => (
                    <div key={review._id} className="review-item-card">
                      <div className="review-avatar">
                        {(review.user?.name || "U").charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <h3>{review.user?.name || "Customer"}</h3>
                        <p className="review-stars">
                          {"★".repeat(review.rating)}
                        </p>
                        <p>{review.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {canWriteReview && (
              <form onSubmit={submitReview} className="review-write-panel">
                <div className="review-panel-title center">
                  <p>Share Experience</p>
                  <h3>Write Your Review</h3>
                  <span>Your feedback helps other buyers choose better.</span>
                </div>

                <label>Your Rating</label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                >
                  <option value={5}>★★★★★ 5 Stars</option>
                  <option value={4}>★★★★☆ 4 Stars</option>
                  <option value={3}>★★★☆☆ 3 Stars</option>
                  <option value={2}>★★☆☆☆ 2 Stars</option>
                  <option value={1}>★☆☆☆☆ 1 Star</option>
                </select>

                <label>Your Review</label>
                <textarea
                  placeholder="Write your review here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <button type="submit">Submit Review</button>
              </form>
            )}
          </div>
        </section>
      </div>

      <style>
        {`
          .product-detail-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.8), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            padding: clamp(12px, 2vw, 32px);
            box-sizing: border-box;
          }

          .product-detail-container {
            width: 100%;
            max-width: none;
            margin: 0;
          }

          .product-detail-hero {
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-radius: 24px;
            box-shadow: 0 8px 24px rgba(62, 39, 35, 0.16);
            padding: clamp(18px, 2.4vw, 40px);
            display: grid;
            grid-template-columns: minmax(320px, 0.9fr) minmax(0, 1.1fr);
            gap: clamp(24px, 3vw, 50px);
            align-items: center;
          }

          .product-image-panel {
            position: relative;
            background: linear-gradient(135deg, #fff1d8, #ead7bd);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: clamp(16px, 2vw, 28px);
            min-height: clamp(360px, 35vw, 620px);
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .product-image-panel img {
            width: 100%;
            height: clamp(330px, 34vw, 580px);
            object-fit: contain;
            border-radius: 18px;
            filter: drop-shadow(0 12px 18px rgba(62, 39, 35, 0.2));
          }

          .detail-wishlist-btn {
            position: absolute;
            top: 22px;
            right: 22px;
            width: 54px;
            height: 54px;
            border-radius: 50%;
            border: 1px solid #c8a77a;
            background: #fffaf2;
            color: #7a4f2a;
            font-size: 34px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 5px 14px rgba(62, 39, 35, 0.2);
          }

          .detail-wishlist-btn.active {
            color: #d32f2f;
            border-color: #d32f2f;
          }

          .product-info-panel {
            min-width: 0;
          }

          .product-small-title {
            margin: 0 0 8px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }

          .product-info-panel h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(38px, 4vw, 72px);
            line-height: 1.05;
          }

          .product-badges {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
          }

          .product-badges span {
            background: #fff1d8;
            color: #3e2723;
            border: 1px solid #c8a77a;
            padding: 8px 14px;
            border-radius: 30px;
            font-weight: 900;
          }

          .stock-badge-green {
            background: #e8f5e9 !important;
            color: #2e7d32 !important;
            border-color: #81c784 !important;
          }

          .stock-badge-red {
            background: #ffebee !important;
            color: #b71c1c !important;
            border-color: #ef9a9a !important;
          }

          .product-description {
            color: #5d4037;
            font-size: clamp(17px, 1.2vw, 24px);
            line-height: 1.7;
            font-weight: 600;
            margin: 18px 0;
          }

          .product-info-panel h2 {
            margin: 14px 0;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: clamp(36px, 3vw, 58px);
          }

          .vendor-box {
            background: #fff8ef;
            border-left: 5px solid #7a4f2a;
            border-radius: 12px;
            padding: 15px 18px;
            margin: 18px 0;
          }

          .vendor-box span {
            display: block;
            color: #8a6b4f;
            font-weight: 900;
            margin-bottom: 5px;
            text-transform: uppercase;
            font-size: 13px;
          }

          .vendor-box strong {
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: 22px;
          }

          .craft-note {
            background: linear-gradient(135deg, #fff1d8, #ead7bd);
            border: 1px solid #c8a77a;
            border-radius: 16px;
            padding: 18px;
            color: #5d4037;
            font-weight: 800;
            line-height: 1.6;
            margin: 20px 0;
          }

          .product-purchase-section {
            display: flex;
            align-items: center;
            gap: 14px;
            flex-wrap: wrap;
            margin-top: 22px;
          }

          .detail-quantity-control {
            height: 54px;
            display: flex;
            align-items: center;
            background: #fff8ef;
            border: 1px solid #c8a77a;
            border-radius: 40px;
            overflow: hidden;
            box-shadow: 0 5px 14px rgba(62, 39, 35, 0.12);
          }

          .detail-quantity-control button {
            width: 52px;
            height: 54px;
            border: none;
            background: #7a4f2a;
            color: white;
            font-size: 24px;
            font-weight: 900;
            cursor: pointer;
          }

          .detail-quantity-control button:hover {
            background: #5c371d;
          }

          .detail-quantity-control button:disabled,
          .detail-add-cart-btn:disabled {
            background: #bdbdbd !important;
            cursor: not-allowed !important;
            box-shadow: none !important;
          }

          .detail-quantity-control span {
            min-width: 56px;
            text-align: center;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 22px;
            font-weight: 900;
          }

          .detail-add-cart-btn,
          .wishlist-action-btn {
            height: 54px;
            background: #7a4f2a;
            color: white;
            border: none;
            border-radius: 40px;
            padding: 0 30px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, serif;
            font-size: 16px;
            box-shadow: 0 5px 14px rgba(62, 39, 35, 0.16);
          }

          .detail-add-cart-btn:hover {
            background: #5c371d;
          }

          .wishlist-action-btn {
            background: #3e2723 !important;
          }

          .wishlist-action-btn:hover {
            background: #5c371d !important;
          }

          .review-redesign-section {
            margin-top: 30px;
            background: rgba(255, 250, 242, 0.98);
            border: 1px solid #c8a77a;
            border-radius: 26px;
            padding: clamp(22px, 3vw, 48px);
            box-shadow: 0 10px 28px rgba(62, 39, 35, 0.16);
          }

          .review-redesign-header {
            border-bottom: 2px solid #d7b98a;
            padding-bottom: 22px;
            margin-bottom: 26px;
          }

          .review-redesign-header p,
          .review-stat-card p,
          .review-panel-title p {
            margin: 0 0 8px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.8px;
          }

          .review-redesign-header h2 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(38px, 3vw, 62px);
          }

          .review-redesign-header span {
            display: block;
            margin-top: 10px;
            color: #5d4037;
            font-size: 18px;
            font-weight: 700;
          }

          .review-stats-row {
            display: grid;
            grid-template-columns: 1.1fr 1fr 1fr;
            gap: 18px;
            margin-bottom: 26px;
          }

          .review-stat-card {
            background: linear-gradient(135deg, #fffaf2, #fff1d8);
            border: 1px solid #c8a77a;
            border-radius: 20px;
            padding: 24px;
            box-shadow: 0 7px 18px rgba(62, 39, 35, 0.11);
          }

          .review-stat-card.dark {
            background: linear-gradient(135deg, #3e2723, #6d4c41);
            color: #fff8ef;
          }

          .review-stat-card.dark p,
          .review-stat-card.dark span {
            color: #fff1d8;
          }

          .review-stat-card h1 {
            margin: 0;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: clamp(28px, 2.8vw, 52px);
          }

          .review-stat-card.dark h1 {
            color: #fff8ef;
          }

          .review-stat-card div {
            color: #ffd36a;
            font-size: 24px;
            letter-spacing: 3px;
            margin: 8px 0;
          }

          .review-stat-card span {
            color: #5d4037;
            font-weight: 800;
          }

          .review-main-grid {
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(360px, 440px);
            gap: 24px;
            align-items: stretch;
          }

          .review-list-panel,
          .review-write-panel {
            background: linear-gradient(135deg, #fffaf2, #fff1d8);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: clamp(22px, 2.2vw, 34px);
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.12);
          }

          .review-panel-title {
            margin-bottom: 22px;
          }

          .review-panel-title.center {
            text-align: center;
          }

          .review-panel-title h3 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(28px, 2vw, 40px);
          }

          .review-panel-title span {
            display: block;
            margin-top: 8px;
            color: #5d4037;
            font-weight: 700;
          }

          .review-empty-box {
            min-height: 310px;
            background: #fff8ef;
            border: 1px dashed #c8a77a;
            border-radius: 20px;
            padding: 28px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: #5d4037;
          }

          .review-empty-icon {
            width: 78px;
            height: 78px;
            border-radius: 50%;
            background: #3e2723;
            color: #ffd36a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            box-shadow: 0 8px 18px rgba(62, 39, 35, 0.25);
            margin-bottom: 18px;
          }

          .review-empty-box h3 {
            margin: 0 0 10px;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: 30px;
          }

          .review-empty-box p {
            margin: 0;
            max-width: 470px;
            line-height: 1.6;
            font-size: 17px;
            font-weight: 700;
          }

          .review-list {
            display: flex;
            flex-direction: column;
            gap: 16px;
          }

          .review-item-card {
            background: #fff8ef;
            border: 1px solid #ead7bd;
            border-radius: 18px;
            padding: 20px;
            display: flex;
            gap: 16px;
          }

          .review-avatar {
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: #3e2723;
            color: #fff8ef;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: Georgia, serif;
            font-weight: 900;
            flex-shrink: 0;
          }

          .review-item-card h3 {
            margin: 0 0 6px;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: 24px;
          }

          .review-item-card p {
            margin: 6px 0;
            color: #5d4037;
            font-weight: 700;
            line-height: 1.6;
          }

          .review-stars {
            color: #b8860b !important;
            font-size: 20px;
            letter-spacing: 2px;
          }

          .review-write-panel {
            display: flex;
            flex-direction: column;
          }

          .review-write-panel label {
            color: #3e2723;
            font-weight: 900;
            margin-bottom: 8px;
          }

          .review-write-panel select,
          .review-write-panel textarea {
            width: 100%;
            padding: 16px;
            border-radius: 14px;
            border: 1px solid #c8a77a;
            background: #fffaf2;
            color: #3e2723;
            margin-bottom: 18px;
            box-sizing: border-box;
            outline: none;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 16px;
          }

          .review-write-panel select:focus,
          .review-write-panel textarea:focus {
            border-color: #7a4f2a;
            box-shadow: 0 0 0 3px rgba(122, 79, 42, 0.16);
          }

          .review-write-panel textarea {
            min-height: 220px;
            resize: vertical;
          }

          .review-write-panel button {
            margin-top: auto;
            width: 100%;
            background: #7a4f2a;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 16px 24px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, serif;
            font-size: 17px;
            box-shadow: 0 6px 16px rgba(62, 39, 35, 0.18);
          }

          .review-write-panel button:hover {
            background: #5c371d;
          }

          .product-loading-card {
            background: #fffaf2;
            border: 1px solid #c8a77a;
            border-radius: 18px;
            padding: 30px;
            color: #3e2723;
          }

          .product-toast {
            position: fixed;
            top: 110px;
            right: 25px;
            z-index: 7000;
            color: white;
            padding: 14px 22px;
            border-radius: 12px;
            font-weight: 800;
            box-shadow: 0 5px 18px rgba(0,0,0,0.25);
          }

          .product-toast.success {
            background: #2e7d32;
          }

          .product-toast.warning {
            background: #ef6c00;
          }

          .product-toast.error {
            background: #b71c1c;
          }

          @media (max-width: 1000px) {
            .review-stats-row {
              grid-template-columns: 1fr 1fr;
            }

            .review-stat-card.dark {
              grid-column: 1 / 3;
            }

            .review-main-grid {
              grid-template-columns: 1fr;
            }

            .review-write-panel {
              order: 1;
            }

            .review-list-panel {
              order: 2;
            }
          }

          @media (max-width: 950px) {
            .product-detail-hero {
              grid-template-columns: 1fr;
            }
          }

          @media (max-width: 600px) {
            .product-image-panel {
              min-height: auto;
            }

            .product-image-panel img {
              height: 280px;
            }

            .product-purchase-section {
              flex-direction: column;
              align-items: stretch;
            }

            .detail-quantity-control {
              width: 100%;
              justify-content: space-between;
            }

            .detail-quantity-control span {
              flex: 1;
            }

            .detail-add-cart-btn,
            .wishlist-action-btn {
              width: 100%;
            }

            .review-stats-row {
              grid-template-columns: 1fr;
            }

            .review-stat-card.dark {
              grid-column: auto;
            }

            .review-redesign-section {
              padding: 18px;
              border-radius: 18px;
            }

            .review-list-panel,
            .review-write-panel {
              padding: 20px;
              border-radius: 18px;
            }

            .review-write-panel textarea {
              min-height: 170px;
            }

            .review-item-card {
              flex-direction: column;
            }

            .product-toast {
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

export default ProductDetail;
