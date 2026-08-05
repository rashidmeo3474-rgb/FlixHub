import { Routes, Route, Navigate } from 'react-router-dom';
import StoreLayout from './components/StoreLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import Payment from './pages/Payment.jsx';
import Success from './pages/Success.jsx';
import Orders from './pages/Orders.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Contact from './pages/Contact.jsx';
import AdminLogin from './admin/AdminLogin.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import StockManager from './admin/StockManager.jsx';
import OrdersManager from './admin/OrdersManager.jsx';
import ProductsManager from './admin/ProductsManager.jsx';
import PaymentSettings from './admin/PaymentSettings.jsx';
import Notifications from './pages/Notifications.jsx';

export default function App() {
  return (
    <Routes>
      {/* ---------- user portal ---------- */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/payment/:orderId" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
        <Route path="/success/:reference" element={<ProtectedRoute><Success /></ProtectedRoute>} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/orders" element={<ProtectedRoute role="user"><Orders /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute role="user"><Notifications /></ProtectedRoute>} />
      </Route>

      {/* ---------- admin portal (separate shell + auth) ---------- */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute role="admin" redirect="/admin/login"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="stock" element={<StockManager />} />
        <Route path="orders" element={<OrdersManager />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="payments" element={<PaymentSettings />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
