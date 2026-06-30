import { useEffect, useState } from "react";
import API from "../services/api";

function Checkout() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(cartItems);
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));

      const defaultAddress = res.data.addresses?.find(
        (address) => address.isDefault
      );

      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
      } else if (res.data.addresses?.length > 0) {
        setSelectedAddressId(res.data.addresses[0]._id);
      }
    } catch (error) {
      console.log(error);
      alert("Please login again");
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const platformFee = Math.round(total * 0.05);
  const vendorPayout = total - platformFee;

  const addAddress = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/addresses", addressForm);

      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));

      const latestAddress = res.data.addresses[res.data.addresses.length - 1];

      if (latestAddress) {
        setSelectedAddressId(latestAddress._id);
      }

      setAddressForm({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
      });

      alert("Address added successfully");
    } catch (error) {
      console.log(error);
      alert("Failed to add address");
    }
  };

  const formatAddress = (address) => {
    return `${address.fullName}, ${address.phone}, ${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  const getSelectedAddress = () => {
    return user?.addresses?.find(
      (address) => address._id === selectedAddressId
    );
  };

  const validateCheckout = () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return false;
    }

    if (!selectedAddressId) {
      alert("Please select or add a delivery address");
      return false;
    }

    const selectedAddress = getSelectedAddress();

    if (!selectedAddress) {
      alert("Selected address not found");
      return false;
    }

    return true;
  };

  const payWithStripe = async () => {
    if (!validateCheckout()) return;

    const selectedAddress = getSelectedAddress();

    try {
      setIsPaying(true);

      const res = await API.post("/payments/create-checkout-session", {
        products: cart.map((item) => ({
          productId: item._id,
          quantity: Number(item.quantity || 1),
        })),
        shippingAddress: formatAddress(selectedAddress),
      });

      if (res.data?.url) {
        window.location.href = res.data.url;
      } else {
        alert("Stripe payment page not created");
      }
    } catch (error) {
      console.log(error);
      alert(
        error.response?.data?.message ||
          "Stripe is not configured. Use Demo Payment."
      );
    } finally {
      setIsPaying(false);
    }
  };

  const demoPayment = async () => {
    if (!validateCheckout()) return;

    const selectedAddress = getSelectedAddress();

    try {
      setIsPaying(true);

      const res = await API.post("/payments/demo-payment", {
        products: cart.map((item) => ({
          productId: item._id,
          quantity: Number(item.quantity || 1),
        })),
        shippingAddress: formatAddress(selectedAddress),
      });

      localStorage.removeItem("cart");

      alert(res.data?.message || "Demo payment successful. Order placed.");
      window.location.href = "/orders";
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Demo payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #c8b6a6",
    width: "100%",
    boxSizing: "border-box",
  };

  const cardStyle = {
    backgroundColor: "#fffaf2",
    padding: "25px",
    borderRadius: "16px",
    border: "1px solid #d6c1a3",
    boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
    marginBottom: "25px",
  };

  return (
    <div
      style={{
        padding: "40px",
        backgroundColor: "#faf6ef",
        minHeight: "100vh",
      }}
    >
      <h1 style={{ fontFamily: "Georgia, serif", color: "#3e2723" }}>
        Checkout
      </h1>

      <div style={cardStyle}>
        <h2>Review Cart Items</h2>

        {cart.length === 0 ? (
          <p>Your cart is empty.</p>
        ) : (
          cart.map((item) => (
            <div
              key={item._id}
              style={{
                borderBottom: "1px solid #ead7bd",
                padding: "12px 0",
              }}
            >
              <strong>{item.name}</strong>

              <p style={{ margin: "6px 0" }}>
                Quantity: {item.quantity || 1}
              </p>

              <p style={{ margin: "6px 0" }}>
                Price: ₹{Number(item.price || 0)}
              </p>

              <p style={{ margin: "6px 0", fontWeight: "800" }}>
                Item Total: ₹
                {Number(item.price || 0) * Number(item.quantity || 1)}
              </p>
            </div>
          ))
        )}

        <h2>Total: ₹{total}</h2>

        <div
          style={{
            marginTop: "15px",
            background: "#fff1d8",
            border: "1px solid #d7b98a",
            borderRadius: "12px",
            padding: "15px",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Marketplace Commission</h3>
          <p>Platform Commission 5%: ₹{platformFee}</p>
          <p>Vendor Earnings 95%: ₹{vendorPayout}</p>
          <p style={{ color: "#5d4037", fontWeight: "700" }}>
            Stripe payment code is included. Demo Payment works without Stripe
            key for presentation.
          </p>
        </div>
      </div>

      <div style={cardStyle}>
        <h2>Select Delivery Address</h2>

        {!user?.addresses || user.addresses.length === 0 ? (
          <p>No saved address. Please add one below.</p>
        ) : (
          user.addresses.map((address) => (
            <label
              key={address._id}
              style={{
                display: "block",
                border: "1px solid #d6c1a3",
                borderRadius: "12px",
                padding: "15px",
                marginBottom: "12px",
                backgroundColor:
                  selectedAddressId === address._id ? "#f1e1bd" : "#faf6ef",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                name="selectedAddress"
                checked={selectedAddressId === address._id}
                onChange={() => setSelectedAddressId(address._id)}
                style={{ marginRight: "10px", width: "auto" }}
              />

              <strong>{address.fullName}</strong>{" "}
              {address.isDefault && (
                <span style={{ color: "#2e7d32" }}>(Default)</span>
              )}

              <p>{address.phone}</p>
              <p>{address.addressLine}</p>
              <p>
                {address.city}, {address.state} - {address.pincode}
              </p>
            </label>
          ))
        )}
      </div>

      <div style={cardStyle}>
        <h2>Add New Address</h2>

        <form
          onSubmit={addAddress}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "15px",
            marginTop: "20px",
          }}
        >
          <input
            style={inputStyle}
            type="text"
            placeholder="Full Name"
            value={addressForm.fullName}
            onChange={(e) =>
              setAddressForm({
                ...addressForm,
                fullName: e.target.value,
              })
            }
            required
          />

          <input
            style={inputStyle}
            type="text"
            placeholder="Phone Number"
            value={addressForm.phone}
            onChange={(e) =>
              setAddressForm({
                ...addressForm,
                phone: e.target.value,
              })
            }
            required
          />

          <textarea
            placeholder="Address Line"
            value={addressForm.addressLine}
            onChange={(e) =>
              setAddressForm({
                ...addressForm,
                addressLine: e.target.value,
              })
            }
            required
            style={{
              ...inputStyle,
              gridColumn: "1 / 3",
              height: "90px",
            }}
          />

          <input
            style={inputStyle}
            type="text"
            placeholder="City"
            value={addressForm.city}
            onChange={(e) =>
              setAddressForm({
                ...addressForm,
                city: e.target.value,
              })
            }
            required
          />

          <input
            style={inputStyle}
            type="text"
            placeholder="State"
            value={addressForm.state}
            onChange={(e) =>
              setAddressForm({
                ...addressForm,
                state: e.target.value,
              })
            }
            required
          />

          <input
            style={inputStyle}
            type="text"
            placeholder="Pincode"
            value={addressForm.pincode}
            onChange={(e) =>
              setAddressForm({
                ...addressForm,
                pincode: e.target.value,
              })
            }
            required
          />

          <button type="submit">Add Address</button>
        </form>
      </div>

      <div
        style={{
          display: "flex",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={payWithStripe}
          disabled={isPaying || cart.length === 0}
          style={{
            padding: "14px 30px",
            borderRadius: "25px",
            fontWeight: "800",
            fontSize: "16px",
            backgroundColor:
              isPaying || cart.length === 0 ? "#9e9e9e" : "#3e2723",
            cursor: isPaying || cart.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          Pay with Stripe ₹{total}
        </button>

        <button
          onClick={demoPayment}
          disabled={isPaying || cart.length === 0}
          style={{
            padding: "14px 30px",
            borderRadius: "25px",
            fontWeight: "800",
            fontSize: "16px",
            backgroundColor:
              isPaying || cart.length === 0 ? "#9e9e9e" : "#7a4f2a",
            cursor: isPaying || cart.length === 0 ? "not-allowed" : "pointer",
          }}
        >
          {isPaying ? "Processing..." : `Demo Payment ₹${total}`}
        </button>
      </div>

      <style>
        {`
          @media (max-width: 650px) {
            form {
              grid-template-columns: 1fr !important;
            }

            textarea {
              grid-column: 1 !important;
            }

            button {
              width: 100%;
            }
          }
        `}
      </style>
    </div>
  );
}

export default Checkout;