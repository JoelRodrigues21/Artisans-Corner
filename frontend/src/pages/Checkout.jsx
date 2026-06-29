import { useEffect, useState } from "react";
import API from "../services/api";


function Checkout() {
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [selectedAddressId, setSelectedAddressId] = useState("");

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
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + Number(item.price || 0) * (item.quantity || 1),
    0
  );

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
      alert("Failed to add address");
    }
  };

  const formatAddress = (address) => {
    return `${address.fullName}, ${address.phone}, ${address.addressLine}, ${address.city}, ${address.state} - ${address.pincode}`;
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }

    if (!selectedAddressId) {
      alert("Please select or add a delivery address");
      return;
    }

    const selectedAddress = user.addresses.find(
      (address) => address._id === selectedAddressId
    );

    if (!selectedAddress) {
      alert("Selected address not found");
      return;
    }

    try {
      await API.post("/orders", {
        buyer: user._id,
        products: cart.map((item) => ({
          product: item._id,
          quantity: item.quantity || 1,
        })),
        totalAmount: total,
        shippingAddress: formatAddress(selectedAddress),
      });

      localStorage.removeItem("cart");

      alert("Order placed successfully");
      window.location.href = "/buyer";
    } catch (error) {
      console.log(error);
      alert("Order failed");
    }
  };

  const inputStyle = {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #c8b6a6",
    width: "100%",
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
    <>
      

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
              <p key={item._id}>
                {item.name} × {item.quantity || 1} = ₹
                {Number(item.price || 0) * (item.quantity || 1)}
              </p>
            ))
          )}

          <h2>Total: ₹{total}</h2>
        </div>

        <div style={cardStyle}>
          <h2>Select Delivery Address</h2>

          {user?.addresses?.length === 0 ? (
            <p>No saved address. Please add one below.</p>
          ) : (
            user?.addresses?.map((address) => (
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
                  style={{ marginRight: "10px" }}
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

        <button
          onClick={placeOrder}
          style={{
            padding: "14px 30px",
            borderRadius: "25px",
            fontWeight: "700",
            fontSize: "16px",
          }}
        >
          Place Order
        </button>
      </div>
    </>
  );
}

export default Checkout;