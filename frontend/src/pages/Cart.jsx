import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Cart() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(savedCart);
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 1800);
  };

  const updateCart = (updatedCart) => {
    setCart(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  const increaseQuantity = (e, productId) => {
    e.stopPropagation();

    const updatedCart = cart.map((item) =>
      item._id === productId
        ? { ...item, quantity: (item.quantity || 1) + 1 }
        : item
    );

    updateCart(updatedCart);
  };

  const decreaseQuantity = (e, productId) => {
    e.stopPropagation();

    const updatedCart = cart.map((item) =>
      item._id === productId
        ? { ...item, quantity: Math.max((item.quantity || 1) - 1, 1) }
        : item
    );

    updateCart(updatedCart);
  };

  const removeFromCart = (e, productId) => {
    e.stopPropagation();

    const updatedCart = cart.filter((item) => item._id !== productId);
    updateCart(updatedCart);
    showToast("Product removed from cart", "warning");
  };

  const clearCart = () => {
    localStorage.removeItem("cart");
    setCart([]);
    showToast("Cart cleared", "warning");
  };

  const totalAmount = cart.reduce(
    (sum, item) =>
      sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + Number(item.quantity || 1),
    0
  );

  return (
    <div className="classic-cart-page">
      {toast && (
        <div
          className={
            toast.type === "warning"
              ? "cart-toast warning"
              : "cart-toast success"
          }
        >
          {toast.message}
        </div>
      )}

      <div className="classic-cart-container">
        <div className="cart-hero">
          <div>
            <p>Shopping Basket</p>
            <h1>My Cart</h1>
            {cart.length > 0 && (
              <span>
                {cart.length} product(s), {totalItems} item(s) in your cart
              </span>
            )}
          </div>

          <button onClick={() => navigate("/")}>Continue Shopping</button>
        </div>

        {cart.length === 0 ? (
          <div className="cart-empty-card">
            <h2>Your cart is empty.</h2>
            <p>Add handmade products to your cart and they will appear here.</p>
            <button onClick={() => navigate("/")}>Start Shopping</button>
          </div>
        ) : (
          <div className="cart-main-layout">
            <div className="cart-items-list">
              {cart.map((product) => {
                const quantity = product.quantity || 1;
                const productTotal = Number(product.price || 0) * quantity;

                return (
                  <div
                    key={product._id}
                    className="classic-cart-row"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="classic-cart-img"
                    />

                    <div className="classic-cart-info">
                      <h2>{product.name}</h2>

                      <p>
                        {product.description?.length > 110
                          ? product.description.slice(0, 110) + "..."
                          : product.description}
                      </p>

                      <h3>₹{product.price}</h3>

                      <div className="cart-quantity-box">
                        <button onClick={(e) => decreaseQuantity(e, product._id)}>
                          −
                        </button>

                        <strong>Quantity: {quantity}</strong>

                        <button onClick={(e) => increaseQuantity(e, product._id)}>
                          +
                        </button>

                        <button
                          onClick={(e) => removeFromCart(e, product._id)}
                          className="cart-remove-btn"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="cart-item-total-box">
                      <p>Item Total</p>
                      <h2>₹{productTotal}</h2>
                      <span>
                        ₹{product.price} × {quantity}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <aside className="cart-summary-card">
              <p>Order Summary</p>
              <h2>Cart Total</h2>

              <div className="summary-line">
                <span>Total Products</span>
                <strong>{cart.length}</strong>
              </div>

              <div className="summary-line">
                <span>Total Items</span>
                <strong>{totalItems}</strong>
              </div>

              <div className="summary-line">
                <span>Subtotal</span>
                <strong>₹{totalAmount}</strong>
              </div>

              <div className="summary-total">
                <span>Total Amount</span>
                <h1>₹{totalAmount}</h1>
              </div>

              <button onClick={() => navigate("/checkout")}>
                Proceed to Checkout
              </button>

              <button onClick={clearCart} className="summary-clear-btn">
                Clear Cart
              </button>
            </aside>
          </div>
        )}
      </div>

      <style>
        {`
          .classic-cart-page {
            min-height: 100vh;
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.8), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            padding: clamp(12px, 2vw, 32px);
            box-sizing: border-box;
          }

          .classic-cart-container {
            width: 100%;
            max-width: none;
            margin: 0;
          }

          .cart-hero {
            background: rgba(255, 250, 242, 0.96);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: clamp(22px, 2.5vw, 40px);
            margin-bottom: 26px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 18px;
            flex-wrap: wrap;
          }

          .cart-hero p {
            margin: 0 0 6px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.7px;
          }

          .cart-hero h1 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(38px, 3vw, 58px);
          }

          .cart-hero span {
            display: block;
            margin-top: 8px;
            color: #5d4037;
            font-weight: 800;
          }

          .cart-hero button,
          .cart-empty-card button,
          .cart-summary-card button {
            background: #7a4f2a;
            color: white;
            border: none;
            border-radius: 30px;
            padding: 13px 24px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, serif;
          }

          .cart-main-layout {
            display: grid;
            grid-template-columns: minmax(0, 1fr) clamp(300px, 24vw, 390px);
            gap: clamp(18px, 2vw, 28px);
            align-items: start;
          }

          .cart-items-list {
            display: flex;
            flex-direction: column;
            gap: 18px;
          }

          .classic-cart-row {
            background: rgba(255, 250, 242, 0.97);
            border: 1px solid #c8a77a;
            border-left: 6px solid #7a4f2a;
            border-radius: 20px;
            padding: clamp(16px, 2vw, 24px);
            display: grid;
            grid-template-columns: clamp(105px, 10vw, 155px) minmax(0, 1fr) clamp(150px, 14vw, 190px);
            gap: clamp(14px, 2vw, 24px);
            align-items: center;
            cursor: pointer;
            box-shadow: 0 7px 18px rgba(62, 39, 35, 0.12);
            transition: 0.25s ease;
          }

          .classic-cart-row:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 26px rgba(62, 39, 35, 0.18);
          }

          .classic-cart-img {
            width: clamp(105px, 10vw, 155px);
            height: clamp(100px, 9vw, 135px);
            object-fit: cover;
            border-radius: 14px;
            border: 1px solid #d7b98a;
            background: #f5f5f5;
          }

          .classic-cart-info {
            min-width: 0;
          }

          .classic-cart-info h2 {
            margin: 0 0 8px;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(21px, 1.5vw, 31px);
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .classic-cart-info p {
            margin: 0 0 12px;
            color: #5d4037;
            font-weight: 700;
            line-height: 1.5;
          }

          .classic-cart-info h3 {
            margin: 0 0 12px;
            color: #6d4c41;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 22px;
          }

          .cart-quantity-box {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .cart-quantity-box button {
            background: #7a4f2a;
            color: white;
            border: none;
            cursor: pointer;
            font-weight: 900;
          }

          .cart-quantity-box button:not(.cart-remove-btn) {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            padding: 0;
            font-size: 20px;
          }

          .cart-quantity-box strong {
            color: #3e2723;
          }

          .cart-remove-btn {
            background: #b71c1c !important;
            border-radius: 30px;
            padding: 10px 18px;
          }

          .cart-item-total-box {
            text-align: right;
          }

          .cart-item-total-box p {
            margin: 0 0 6px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            font-size: 13px;
          }

          .cart-item-total-box h2 {
            margin: 0;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 28px;
          }

          .cart-item-total-box span {
            display: block;
            margin-top: 6px;
            color: #7a5c44;
            font-weight: 800;
          }

          .cart-summary-card {
            position: sticky;
            top: 115px;
            background: rgba(255, 250, 242, 0.98);
            border: 1px solid #c8a77a;
            border-radius: 22px;
            padding: 26px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .cart-summary-card p {
            margin: 0 0 6px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.7px;
          }

          .cart-summary-card h2 {
            margin: 0 0 20px;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: 32px;
          }

          .summary-line {
            display: flex;
            justify-content: space-between;
            gap: 15px;
            padding: 14px 0;
            border-bottom: 1px solid #ead7bd;
            color: #5d4037;
            font-weight: 800;
          }

          .summary-total {
            margin: 22px 0;
            padding: 18px;
            border-radius: 16px;
            background: linear-gradient(135deg, #fff1d8, #ead7bd);
            border: 1px solid #c8a77a;
          }

          .summary-total span {
            color: #5d4037;
            font-weight: 900;
          }

          .summary-total h1 {
            margin: 8px 0 0;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 36px;
          }

          .cart-summary-card button {
            width: 100%;
            margin-top: 10px;
          }

          .summary-clear-btn {
            background: #b71c1c !important;
          }

          .cart-empty-card {
            background: rgba(255, 250, 242, 0.96);
            border: 1px solid #c8a77a;
            border-radius: 18px;
            padding: 34px;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .cart-empty-card h2 {
            color: #3e2723;
            font-family: Georgia, serif;
          }

          .cart-empty-card p {
            color: #5d4037;
            font-weight: 700;
          }

          .cart-toast {
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

          .cart-toast.success {
            background: #2e7d32;
          }

          .cart-toast.warning {
            background: #ef6c00;
          }

          @media (max-width: 1050px) {
            .cart-main-layout {
              grid-template-columns: 1fr;
            }

            .cart-summary-card {
              position: static;
            }
          }

          @media (max-width: 760px) {
            .cart-hero {
              flex-direction: column;
              align-items: flex-start;
            }

            .cart-hero button {
              width: 100%;
            }

            .classic-cart-row {
              grid-template-columns: 105px minmax(0, 1fr);
            }

            .classic-cart-img {
              width: 105px;
              height: 100px;
            }

            .cart-item-total-box {
              grid-column: 1 / 3;
              text-align: left;
              border-top: 1px solid #ead7bd;
              padding-top: 14px;
            }
          }

          @media (max-width: 480px) {
            .classic-cart-page {
              padding: 10px;
            }

            .cart-hero {
              padding: 20px;
              border-radius: 16px;
            }

            .cart-hero h1 {
              font-size: 32px;
            }

            .classic-cart-row {
              grid-template-columns: 82px minmax(0, 1fr);
              padding: 12px;
              border-radius: 16px;
            }

            .classic-cart-img {
              width: 82px;
              height: 82px;
              border-radius: 10px;
            }

            .classic-cart-info h2 {
              font-size: 18px;
            }

            .classic-cart-info p {
              display: none;
            }

            .classic-cart-info h3 {
              font-size: 18px;
            }

            .cart-quantity-box {
              gap: 8px;
            }

            .cart-remove-btn {
              width: 100%;
            }

            .cart-summary-card {
              padding: 20px;
              border-radius: 16px;
            }

            .cart-toast {
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

export default Cart;