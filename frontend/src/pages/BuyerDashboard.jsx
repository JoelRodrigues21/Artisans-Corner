import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";

function BuyerDashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [activeSection, setActiveSection] = useState("profile");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [toast, setToast] = useState(null);

  const [profileForm, setProfileForm] = useState({
    email: "",
    phone: "",
  });

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });

    setTimeout(() => {
      setToast(null);
    }, 1800);
  };

  const saveUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");

      saveUser(res.data);

      setProfileForm({
        email: res.data.email || "",
        phone: res.data.phone || "",
      });
    } catch (error) {
      console.log(error);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      const res = await API.put("/auth/profile", profileForm);

      saveUser(res.data);
      setIsEditingProfile(false);
      showToast("Profile updated successfully");
    } catch (error) {
      showToast(
        error.response?.data?.message || "Profile update failed",
        "error"
      );
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/addresses", addressForm);

      saveUser(res.data);

      setAddressForm({
        fullName: "",
        phone: "",
        addressLine: "",
        city: "",
        state: "",
        pincode: "",
      });

      setShowAddressForm(false);
      showToast("Address added successfully");
    } catch (error) {
      showToast("Failed to add address", "error");
    }
  };

  const deleteAddress = async (addressId) => {
    if (!window.confirm("Delete this address?")) return;

    try {
      const res = await API.delete(`/auth/addresses/${addressId}`);
      saveUser(res.data);
      showToast("Address deleted", "warning");
    } catch (error) {
      showToast("Failed to delete address", "error");
    }
  };

  const setDefaultAddress = async (addressId) => {
    try {
      const res = await API.put(`/auth/addresses/${addressId}/default`);
      saveUser(res.data);
      showToast("Default address updated");
    } catch (error) {
      showToast("Failed to set default address", "error");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const defaultAddress = user?.addresses?.find(
    (address) => address.isDefault
  );

  const getInitials = () => {
    if (!user?.name) return "U";
    return user.name.charAt(0).toUpperCase();
  };

  return (
    <div className="classic-buyer-page">
      {toast && (
        <div
          className={
            toast.type === "error"
              ? "buyer-toast error"
              : toast.type === "warning"
              ? "buyer-toast warning"
              : "buyer-toast success"
          }
        >
          {toast.message}
        </div>
      )}

      <div className="classic-buyer-layout">
        <aside className="classic-sidebar">
          <div className="classic-user-card">
            <div className="classic-avatar">{getInitials()}</div>

            <div>
              <p>Hello,</p>
              <h2>{user?.name}</h2>
            </div>
          </div>

          <div className="classic-menu-card">
            <div className="classic-menu-title">ACCOUNT SETTINGS</div>

            <button
              className={
                activeSection === "profile"
                  ? "classic-menu-item active"
                  : "classic-menu-item"
              }
              onClick={() => setActiveSection("profile")}
            >
              Profile Information
            </button>

            <button
              className={
                activeSection === "addresses"
                  ? "classic-menu-item active"
                  : "classic-menu-item"
              }
              onClick={() => setActiveSection("addresses")}
            >
              Manage Addresses
            </button>

            <Link to="/orders" className="classic-orders-link">
              MY ORDERS
            </Link>
          </div>
        </aside>

        <main className="classic-main-card">
          {activeSection === "profile" && (
            <>
              <div className="classic-page-heading">
                <div>
                  <p>Buyer Profile</p>
                  <h1>Personal Information</h1>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="buyer-heading-logout-btn"
                >
                  Logout
                </button>
              </div>

              <div className="classic-profile-grid">
                <section className="classic-info-panel">
                  <div className="classic-panel-header">
                    <h2>Account Details</h2>
                    <p>Your basic account information</p>
                  </div>

                  <div className="classic-detail-grid">
                    <div className="classic-detail-box">
                      <span>Full Name</span>
                      <h3>{user?.name}</h3>
                    </div>

                    <div className="classic-detail-box">
                      <span>Your Gender</span>
                      <h3>{user?.gender}</h3>
                    </div>

                    {!isEditingProfile ? (
                      <>
                        <div className="classic-detail-box">
                          <span>Email Address</span>
                          <h3>{user?.email}</h3>
                        </div>

                        <div className="classic-detail-box">
                          <span>Mobile Number</span>
                          <h3>{user?.phone}</h3>
                        </div>

                        <button
                          onClick={() => setIsEditingProfile(true)}
                          className="classic-primary-btn"
                        >
                          Edit Email / Mobile
                        </button>
                      </>
                    ) : (
                      <form
                        onSubmit={updateProfile}
                        className="classic-edit-form"
                      >
                        <input
                          type="email"
                          placeholder="Email Address"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              email: e.target.value,
                            })
                          }
                          required
                        />

                        <input
                          type="text"
                          placeholder="Mobile Number"
                          value={profileForm.phone}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              phone: e.target.value,
                            })
                          }
                          required
                        />

                        <div className="classic-form-actions">
                          <button type="submit">Save Changes</button>

                          <button
                            type="button"
                            onClick={() => setIsEditingProfile(false)}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </section>

                <section className="classic-info-panel address-panel">
                  <div className="classic-panel-header">
                    <h2>Default Address</h2>
                    <p>Your selected delivery location</p>
                  </div>

                  {defaultAddress ? (
                    <div className="classic-address-card">
                      <div className="classic-detail-box">
                        <span>Name</span>
                        <h3>{defaultAddress.fullName}</h3>
                      </div>

                      <div className="classic-detail-box">
                        <span>Phone</span>
                        <h3>{defaultAddress.phone}</h3>
                      </div>

                      <div className="classic-detail-box full">
                        <span>Address</span>
                        <h3>
                          {defaultAddress.addressLine}, {defaultAddress.city},{" "}
                          {defaultAddress.state} - {defaultAddress.pincode}
                        </h3>
                      </div>
                    </div>
                  ) : (
                    <div className="classic-empty-address">
                      <h3>No default address added yet.</h3>
                      <p>Go to Manage Addresses and add one.</p>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}

          {activeSection === "addresses" && (
            <>
              <div className="classic-page-heading">
                <div>
                  <p>Delivery Details</p>
                  <h1>Manage Addresses</h1>
                </div>

                <button
                  onClick={() => setShowAddressForm(true)}
                  className="classic-primary-btn"
                >
                  + Add New Address
                </button>
              </div>

              {showAddressForm && (
                <div
                  className="address-modal-overlay"
                  onClick={() => setShowAddressForm(false)}
                >
                  <div
                    className="address-modal-card"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="address-modal-header">
                      <div>
                        <p>Delivery Location</p>
                        <h2>Add New Address</h2>
                      </div>

                      <button
                        type="button"
                        className="address-modal-close"
                        onClick={() => setShowAddressForm(false)}
                      >
                        X
                      </button>
                    </div>

                    <form onSubmit={addAddress} className="address-modal-form">
                      <input
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
                      />

                      <input
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

                      <div className="address-modal-actions">
                        <button type="submit">Save Address</button>

                        <button
                          type="button"
                          onClick={() => setShowAddressForm(false)}
                          className="address-cancel-btn"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {!user?.addresses || user.addresses.length === 0 ? (
                <div className="classic-empty-address">
                  <h3>No address added yet.</h3>
                  <p>Add your first delivery address.</p>
                </div>
              ) : (
                <div className="classic-address-list">
                  {user.addresses.map((address) => (
                    <div
                      key={address._id}
                      className={
                        address.isDefault
                          ? "classic-saved-address default"
                          : "classic-saved-address"
                      }
                    >
                      <h3>
                        {address.fullName}
                        {address.isDefault && <span>DEFAULT</span>}
                      </h3>

                      <p>{address.phone}</p>

                      <p>
                        {address.addressLine}, {address.city}, {address.state} -{" "}
                        {address.pincode}
                      </p>

                      <div className="classic-address-actions">
                        {!address.isDefault && (
                          <button
                            onClick={() => setDefaultAddress(address._id)}
                          >
                            Set Default
                          </button>
                        )}

                        <button
                          onClick={() => deleteAddress(address._id)}
                          className="classic-delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <style>
        {`
          .classic-buyer-page {
            min-height: calc(100dvh - 92px);
            background:
              radial-gradient(circle at top left, rgba(255, 235, 196, 0.8), transparent 35%),
              linear-gradient(135deg, #f7f1e8 0%, #ead8bd 100%);
            padding: clamp(14px, 2vw, 30px);
            box-sizing: border-box;
          }

          .classic-buyer-layout {
            width: 100%;
            max-width: none;
            min-height: calc(100dvh - 150px);
            margin: 0;
            display: grid;
            grid-template-columns: clamp(260px, 20vw, 360px) minmax(0, 1fr);
            gap: clamp(18px, 2vw, 32px);
          }

          .classic-sidebar {
            display: flex;
            flex-direction: column;
            gap: 18px;
            min-height: 100%;
          }

          .classic-user-card,
          .classic-menu-card,
          .classic-main-card,
          .classic-info-panel {
            background: rgba(255, 250, 242, 0.95);
            border: 1px solid #c8a77a;
            box-shadow: 0 8px 22px rgba(62, 39, 35, 0.14);
          }

          .classic-user-card {
            border-radius: 18px;
            padding: 22px;
            display: flex;
            align-items: center;
            gap: 16px;
          }

          .classic-avatar {
            width: 68px;
            height: 68px;
            border-radius: 50%;
            background: linear-gradient(135deg, #7a4f2a, #3e2723);
            color: #fff8ef;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
            font-weight: 900;
            font-family: Georgia, serif;
            border: 3px solid #d7b98a;
          }

          .classic-user-card p {
            margin: 0;
            color: #7a5c44;
            font-weight: 700;
          }

          .classic-user-card h2 {
            margin: 4px 0 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: 28px;
          }

          .classic-menu-card {
            border-radius: 18px;
            overflow: hidden;
            flex: 1;
            display: flex;
            flex-direction: column;
          }

          .classic-menu-title {
            padding: 20px 24px;
            background: #3e2723;
            color: #fff8ef;
            font-weight: 900;
            letter-spacing: 0.8px;
          }

          .classic-menu-item,
          .classic-orders-link {
            width: 100%;
            padding: 19px 24px;
            background: transparent;
            color: #3e2723;
            border: none;
            border-bottom: 1px solid #ead7bd;
            text-align: left;
            font-size: 16px;
            font-weight: 800;
            text-decoration: none;
            cursor: pointer;
            font-family: Georgia, serif;
          }

          .classic-menu-item:hover,
          .classic-orders-link:hover {
            background: #fff1d8;
          }

          .classic-menu-item.active {
            background: #ead7bd;
            color: #3e2723;
            border-left: 5px solid #7a4f2a;
          }

          .classic-orders-link {
            display: block;
          }

          .classic-main-card {
            border-radius: 22px;
            padding: clamp(24px, 2.5vw, 44px);
            box-sizing: border-box;
            min-height: 100%;
            display: flex;
            flex-direction: column;
          }

          .classic-page-heading {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            margin-bottom: 28px;
            border-bottom: 2px solid #d7b98a;
            padding-bottom: 20px;
          }

          .classic-page-heading p {
            margin: 0 0 6px;
            color: #7a5c44;
            font-weight: 800;
            letter-spacing: 0.7px;
            text-transform: uppercase;
          }

          .classic-page-heading h1 {
            margin: 0;
            color: #3e2723;
            font-size: clamp(34px, 2.8vw, 54px);
            font-family: Georgia, serif;
          }

          .buyer-heading-logout-btn {
            background: #3e2723;
            color: #fff8ef;
            padding: 13px 26px;
            border-radius: 30px;
            font-weight: 900;
            border: none;
            cursor: pointer;
            font-family: Georgia, serif;
            white-space: nowrap;
          }

          .buyer-heading-logout-btn:hover {
            background: #5c371d;
            transform: translateY(-2px);
          }

          .classic-profile-grid {
            flex: 1;
            display: grid;
            grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
            gap: clamp(20px, 2vw, 32px);
            align-items: stretch;
          }

          .classic-info-panel {
            border-radius: 18px;
            padding: clamp(22px, 2vw, 36px);
            min-height: 100%;
            height: 100%;
            box-sizing: border-box;
          }

          .classic-panel-header {
            margin-bottom: 20px;
          }

          .classic-panel-header h2 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: 30px;
          }

          .classic-panel-header p {
            margin: 6px 0 0;
            color: #7a5c44;
            font-weight: 600;
          }

          .classic-detail-grid,
          .classic-address-card {
            display: grid;
            gap: 16px;
          }

          .classic-detail-box {
            background: #fff8ef;
            border: 1px solid #ead7bd;
            border-left: 5px solid #7a4f2a;
            border-radius: 12px;
            padding: 17px 20px;
          }

          .classic-detail-box span {
            display: block;
            color: #8a6b4f;
            font-weight: 800;
            margin-bottom: 7px;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .classic-detail-box h3 {
            margin: 0;
            color: #3e2723;
            font-size: clamp(19px, 1.25vw, 27px);
            font-family: Georgia, serif;
            line-height: 1.45;
            word-break: break-word;
          }

          .classic-primary-btn,
          .classic-edit-form button,
          .classic-address-actions button {
            background: #7a4f2a;
            color: white;
            border: none;
            border-radius: 10px;
            padding: 13px 22px;
            font-weight: 900;
            cursor: pointer;
            font-family: Georgia, serif;
          }

          .classic-primary-btn:hover,
          .classic-edit-form button:hover,
          .classic-address-actions button:hover {
            background: #5c371d;
          }

          .classic-edit-form {
            display: grid;
            gap: 16px;
          }

          .classic-edit-form input {
            width: 100%;
            padding: 13px;
            border-radius: 10px;
            border: 1px solid #c8a77a;
            background: #fffaf2;
            box-sizing: border-box;
            font-family: "Segoe UI", Arial, sans-serif;
          }

          .classic-form-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
          }

          .classic-empty-address {
            background: #fff8ef;
            border: 1px dashed #c8a77a;
            border-radius: 14px;
            padding: 30px;
            color: #5d4037;
          }

          .classic-empty-address h3 {
            margin-top: 0;
            font-family: Georgia, serif;
          }

          .classic-address-list {
            display: grid;
            grid-template-columns: 1fr;
            gap: 18px;
          }

          .classic-saved-address {
            background: linear-gradient(135deg, #fffaf2, #fff1d8);
            border: 1px solid #d7b98a;
            border-left: 6px solid #7a4f2a;
            border-radius: 18px;
            padding: 24px;
            box-shadow: 0 6px 16px rgba(62, 39, 35, 0.12);
            transition: 0.25s ease;
          }

          .classic-saved-address:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 24px rgba(62, 39, 35, 0.18);
          }

          .classic-saved-address.default {
            background: linear-gradient(135deg, #fff2cf, #ffe3aa);
            border-left-color: #3e2723;
          }

          .classic-saved-address h3 {
            margin: 0 0 10px;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(22px, 1.4vw, 30px);
            display: flex;
            align-items: center;
            gap: 12px;
            flex-wrap: wrap;
          }

          .classic-saved-address h3 span {
            background-color: #2e7d32;
            color: white;
            padding: 5px 12px;
            border-radius: 30px;
            font-size: 12px;
            font-weight: 900;
            letter-spacing: 0.5px;
          }

          .classic-saved-address p {
            margin: 8px 0;
            color: #5d4037;
            font-size: clamp(16px, 1vw, 20px);
            line-height: 1.6;
          }

          .classic-address-actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 18px;
            padding-top: 15px;
            border-top: 1px solid #d7b98a;
          }

          .classic-address-actions button {
            border-radius: 30px;
            padding: 11px 20px;
            font-weight: 900;
          }

          .classic-delete-btn {
            background-color: #b71c1c !important;
          }

          .classic-delete-btn:hover {
            background-color: #8b0000 !important;
          }

          .address-modal-overlay {
            position: fixed;
            inset: 0;
            background: rgba(62, 39, 35, 0.58);
            backdrop-filter: blur(4px);
            z-index: 5000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
          }

          .address-modal-card {
            width: min(720px, 100%);
            background:
              radial-gradient(circle at top left, rgba(255, 237, 203, 0.9), transparent 38%),
              #fffaf2;
            border: 2px solid #c8a77a;
            border-radius: 24px;
            box-shadow: 0 18px 45px rgba(62, 39, 35, 0.38);
            padding: 28px;
            animation: addressPopup 0.25s ease;
          }

          @keyframes addressPopup {
            from {
              transform: translateY(18px) scale(0.96);
              opacity: 0;
            }

            to {
              transform: translateY(0) scale(1);
              opacity: 1;
            }
          }

          .address-modal-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 20px;
            padding-bottom: 18px;
            margin-bottom: 22px;
            border-bottom: 2px solid #d7b98a;
          }

          .address-modal-header p {
            margin: 0 0 6px;
            color: #7a5c44;
            font-weight: 900;
            text-transform: uppercase;
            letter-spacing: 0.7px;
          }

          .address-modal-header h2 {
            margin: 0;
            color: #3e2723;
            font-family: Georgia, serif;
            font-size: clamp(28px, 2vw, 40px);
          }

          .address-modal-close {
            width: 42px;
            height: 42px;
            border-radius: 50%;
            padding: 0;
            background: #3e2723;
            color: #fff8ef;
            border: 1px solid #c8a77a;
            font-size: 20px;
            line-height: 1;
            cursor: pointer;
          }

          .address-modal-close:hover {
            background: #5c371d;
          }

          .address-modal-form {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .address-modal-form input,
          .address-modal-form textarea {
            width: 100%;
            padding: 14px 16px;
            border-radius: 12px;
            border: 1px solid #c8a77a;
            background: #fff8ef;
            color: #3e2723;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 15px;
            box-sizing: border-box;
            outline: none;
          }

          .address-modal-form input:focus,
          .address-modal-form textarea:focus {
            border-color: #7a4f2a;
            box-shadow: 0 0 0 3px rgba(122, 79, 42, 0.16);
          }

          .address-modal-form textarea {
            grid-column: 1 / 3;
            min-height: 95px;
            resize: vertical;
          }

          .address-modal-actions {
            grid-column: 1 / 3;
            display: flex;
            justify-content: flex-end;
            gap: 12px;
            padding-top: 10px;
          }

          .address-modal-actions button {
            border-radius: 30px;
            padding: 13px 24px;
            font-weight: 900;
            background: #7a4f2a;
            color: white;
            border: none;
            cursor: pointer;
            font-family: Georgia, serif;
          }

          .address-cancel-btn {
            background: #fff8ef !important;
            color: #3e2723 !important;
            border: 1px solid #c8a77a !important;
          }

          .address-cancel-btn:hover {
            background: #fff1d8 !important;
          }

          .buyer-toast {
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

          .buyer-toast.success {
            background: #2e7d32;
          }

          .buyer-toast.warning {
            background: #ef6c00;
          }

          .buyer-toast.error {
            background: #b71c1c;
          }

          @media (max-width: 950px) {
            .classic-buyer-layout {
              grid-template-columns: 1fr;
              min-height: auto;
            }

            .classic-sidebar {
              min-height: auto;
            }

            .classic-menu-card {
              flex: unset;
            }

            .classic-profile-grid {
              grid-template-columns: 1fr;
            }

            .classic-info-panel {
              min-height: auto;
              height: auto;
            }
          }

          @media (max-width: 650px) {
            .address-modal-card {
              padding: 20px;
              border-radius: 18px;
            }

            .address-modal-form {
              grid-template-columns: 1fr;
            }

            .address-modal-form textarea,
            .address-modal-actions {
              grid-column: 1;
            }

            .address-modal-actions {
              flex-direction: column;
            }

            .address-modal-actions button {
              width: 100%;
            }
          }

          @media (max-width: 600px) {
            .classic-buyer-page {
              padding: 14px;
            }

            .classic-main-card {
              padding: 20px;
            }

            .classic-page-heading {
              flex-direction: column;
              align-items: flex-start;
            }

            .buyer-heading-logout-btn {
              width: 100%;
            }

            .classic-user-card {
              padding: 18px;
            }

            .classic-avatar {
              width: 58px;
              height: 58px;
              font-size: 26px;
            }

            .classic-address-actions {
              flex-direction: column;
            }

            .classic-address-actions button {
              width: 100%;
            }

            .buyer-toast {
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

export default BuyerDashboard;