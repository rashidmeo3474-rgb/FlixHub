import { Routes, Route, Navigate } from 'react-router-dom';
import StoreLayout from './components/StoreLayout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

/* store pages */
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
import UserDashboard from './pages/UserDashboard.jsx';

/* admin */
import AdminLogin from './admin/AdminLogin.jsx';
import AdminLayout from './admin/AdminLayout.jsx';
import Dashboard from './admin/Dashboard.jsx';
import OrdersManager from './admin/OrdersManager.jsx';
import ProductsManager from './admin/ProductsManager.jsx';
import StockManager from './admin/StockManager.jsx';
import UsersManager from './admin/UsersManager.jsx';
import PaymentProofs from './admin/PaymentProofs.jsx';
import PaymentSettings from './admin/PaymentSettings.jsx';
import ActivityLogPage from './admin/ActivityLogPage.jsx';
import SubscriptionsManager from './admin/SubscriptionsManager.jsx';
import AccountScreenManager from './admin/AccountScreenManager.jsx';
import SupportInbox from './admin/SupportInbox.jsx';
import SubscriptionInventory from './admin/SubscriptionInventory.jsx';
import MySubscriptions from './pages/MySubscriptions.jsx';

export default function App() {
  return (
    <Routes>
      {/* ── User portal ── */}
      <Route element={<StoreLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/payment/:orderId" element={<Payment />} />
        <Route path="/success/:reference" element={<Success />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute role="user"><Orders /></ProtectedRoute>} />
        <Route path="/subscriptions" element={<ProtectedRoute role="user"><MySubscriptions /></ProtectedRoute>} />
      </Route>

      {/* ── Admin portal ── */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedRoute role="admin" redirect="/admin/login"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="orders" element={<OrdersManager />} />
        <Route path="products" element={<ProductsManager />} />
        <Route path="stock" element={<StockManager />} />
        <Route path="users" element={<UsersManager />} />
        <Route path="payment-proofs" element={<PaymentProofs />} />
        <Route path="settings" element={<PaymentSettings />} />
        <Route path="activity"       element={<ActivityLogPage />} />
        <Route path="subscriptions"  element={<SubscriptionsManager />} />
        <Route path="accounts"       element={<AccountScreenManager />} />
        <Route path="support"        element={<SupportInbox />} />
        <Route path="inventory"      element={<SubscriptionInventory />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
