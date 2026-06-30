import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import VendorLogin from "./pages/VendorLogin";
import Register from "./pages/Register";
import VendorRegister from "./pages/VendorRegister";
import AdminLogin from "./pages/AdminLogin";

import ProductDetail from "./pages/ProductDetail";
import Wishlist from "./pages/Wishlist";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import PaymentSuccess from "./pages/PaymentSuccess";

import BuyerDashboard from "./pages/BuyerDashboard";
import VendorDashboard from "./pages/VendorDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/vendor-login" element={<VendorLogin />} />

        <Route path="/register" element={<Register />} />
        <Route path="/vendor-register" element={<VendorRegister />} />

        <Route path="/admin-login" element={<AdminLogin />} />

        <Route path="/product/:id" element={<ProductDetail />} />

        <Route
          path="/wishlist"
          element={
            <ProtectedRoute allowedRoles={["buyer", "admin"]}>
              <Wishlist />
            </ProtectedRoute>
          }
        />

        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["buyer", "admin"]}>
              <Cart />
            </ProtectedRoute>
          }
        />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute allowedRoles={["buyer", "admin"]}>
              <Checkout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/orders"
          element={
            <ProtectedRoute allowedRoles={["buyer", "vendor", "admin"]}>
              <Orders />
            </ProtectedRoute>
          }
        />

        <Route
          path="/payment-success"
          element={
            <ProtectedRoute allowedRoles={["buyer", "admin"]}>
              <PaymentSuccess />
            </ProtectedRoute>
          }
        />

        <Route
          path="/buyer"
          element={
            <ProtectedRoute allowedRoles={["buyer", "admin"]}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vendor"
          element={
            <ProtectedRoute allowedRoles={["vendor", "admin"]}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="/dashboard" element={<Navigate to="/buyer" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;