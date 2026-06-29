import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminLogin from "./pages/AdminLogin";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import VendorDashboard from "./pages/VendorDashboard";
import BuyerDashboard from "./pages/BuyerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Orders from "./pages/Orders";
import Checkout from "./pages/Checkout";
import Wishlist from "./pages/Wishlist";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["vendor", "admin"]}>
              <VendorDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;