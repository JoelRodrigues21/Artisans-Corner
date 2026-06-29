import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HiShoppingCart } from "react-icons/hi2";

function ProductCard({ product, onWishlistChange }) {
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));
  const isVendor = user?.role === "vendor";
  const canShop = !isVendor;
  const stockCount = Number(product.stock || 0);
  const isOutOfStock = stockCount <= 0;

  useEffect(() => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist")) || [];
    const exists = wishlist.some((item) => item._id === product._id);
    setIsWishlisted(exists);
  }, [product._id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 1800);
  };

  const openProduct = () => {
    navigate(`/product/${product._id}`);
  };

  const addToCart = (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "buyer" && user.role !== "admin") {
      showToast("Only buyers can add products to cart", "error");
      return;
    }

    if (isOutOfStock) {
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
      showToast("Cart quantity updated successfully");
    } else {
      cart.push({ ...product, quantity: 1 });
      showToast("Product added to cart successfully");
    }

    localStorage.setItem("cart", JSON.stringify(cart));
  };

  const toggleWishlist = (e) => {
    e.stopPropagation();

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
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      setIsWishlisted(false);
      showToast("Product removed from wishlist", "warning");
    } else {
      updatedWishlist = [...wishlist, product];
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      setIsWishlisted(true);
      showToast("Product added to wishlist successfully");
    }

    if (onWishlistChange) {
      onWishlistChange(updatedWishlist);
    }
  };

  return (
    <>
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

      <div onClick={openProduct} className="product-card">
        {canShop && (
          <button
            onClick={toggleWishlist}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            className={
              isWishlisted
                ? "product-wishlist-btn wishlisted"
                : "product-wishlist-btn"
            }
          >
            {isWishlisted ? "♥" : "♡"}
          </button>
        )}

        <img src={product.image} alt={product.name} className="product-card-img" />

        <div className="product-card-body">
          <h3 className="product-card-title">{product.name}</h3>

          <p className="product-card-desc">
            {product.description?.length > 60
              ? product.description.slice(0, 60) + "..."
              : product.description}
          </p>

          <h3 className="product-card-price">₹{product.price}</h3>

          <p className={isOutOfStock ? "product-stock-red" : "product-stock-green"}>
            {isOutOfStock ? "Out of Stock" : `In Stock: ${stockCount}`}
          </p>

          <div className={canShop ? "product-card-actions" : "product-card-actions single"}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                openProduct();
              }}
              className="product-view-btn"
            >
              View Product
            </button>

            {canShop && (
              <button
                onClick={addToCart}
                title={isOutOfStock ? "Out of Stock" : "Add to Cart"}
                className="product-cart-icon-btn"
                disabled={isOutOfStock}
              >
                <HiShoppingCart size={25} />
                <span className="cart-plus-badge">+</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductCard;
