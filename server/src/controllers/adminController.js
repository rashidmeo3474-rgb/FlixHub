import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import ActivityLog from '../models/ActivityLog.js';
import { asyncHandler } from '../middleware/error.js';

/* ─── Dashboard stats ─── */
export const stats = asyncHandler(async (req, res) => {
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(); startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0);

  const [
    ordersToday, revenueAgg, revenueMonthAgg, stockAgg,
    customers, pendingOrders, totalOrders
  ] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay }, status: { $in: ['paid', 'delivered'] } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: { $in: ['paid', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfMonth }, status: { $in: ['paid', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Account.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$product', count: { $sum: 1 } } }
    ]),
    User.countDocuments({ role: 'user' }),
    Order.countDocuments({ status: 'pending' }),
    Order.countDocuments({})
  ]);

  const inStock = stockAgg.reduce((sum, s) => sum + s.count, 0);
  res.json({
    ordersToday,
    revenueToday: revenueAgg[0]?.total || 0,
    revenueMonth: revenueMonthAgg[0]?.total || 0,
    accountsInStock: inStock,
    lowStockProducts: stockAgg.filter((s) => s.count < 10).length,
    customers,
    pendingOrders,
    totalOrders
  });
});

/* ─── Stock overview ─── */
export const stockOverview = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ name: 1 });
  const counts = await Account.aggregate([
    { $group: { _id: { product: '$product', status: '$status' }, count: { $sum: 1 } } }
  ]);
  const rows = products.map((p) => {
    const forProduct = counts.filter((c) => String(c._id.product) === String(p._id));
    const pick = (status) => forProduct.find((c) => c._id.status === status)?.count || 0;
    return {
      id: p._id, name: p.name, quality: p.quality, monthlyPrice: p.monthlyPrice,
      available: pick('available'), assigned: pick('assigned'), replaced: pick('replaced'),
      active: p.active
    };
  });
  res.json({ stock: rows });
});

/* ─── Add stock accounts ─── */
export const addAccounts = asyncHandler(async (req, res) => {
  const { productId, accounts = [] } = req.body;
  if (!productId || !accounts.length) return res.status(422).json({ message: 'productId and accounts are required' });
  if (!(await Product.exists({ _id: productId }))) return res.status(404).json({ message: 'Product not found' });

  const docs = accounts
    .filter((a) => a.login && a.password)
    .map((a) => ({ product: productId, login: a.login.trim(), password: a.password, profile: a.profile || '' }));
  if (!docs.length) return res.status(422).json({ message: 'Each account needs a login and password' });

  const created = await Account.insertMany(docs);
  await ActivityLog.create({ actor: req.user._id, action: 'stock_added', details: { productId, count: created.length } });
  res.status(201).json({ added: created.length });
});

/* ─── Delete a single account from stock ─── */
export const deleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findByIdAndDelete(req.params.id);
  if (!account) return res.status(404).json({ message: 'Account not found' });
  res.json({ ok: true });
});

/* ─── All orders ─── */
export const allOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 30, search = '' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) filter.reference = { $regex: search, $options: 'i' };

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .populate('user', 'email name phone'),
    Order.countDocuments(filter)
  ]);
  res.json({ orders, total, page: Number(page) });
});

/* ─── Single order detail ─── */
export const getOrderDetail = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'email name phone');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});

/* ─── Update order status + optional notes ─── */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, adminNotes, rejectionReason } = req.body;
  const update = { status };
  if (adminNotes !== undefined) update.adminNotes = adminNotes;
  if (rejectionReason !== undefined) update.rejectionReason = rejectionReason;
  const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true }).populate('user', 'email name');
  if (!order) return res.status(404).json({ message: 'Order not found' });
  await ActivityLog.create({ actor: req.user._id, user: order.user?._id, action: 'order_status_updated', details: { orderId: order._id, status } });
  res.json({ order });
});

/* ─── Products ─── */
export const upsertProduct = asyncHandler(async (req, res) => {
  const { id, ...data } = req.body;
  if (data.name && !data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const product = id
    ? await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    : await Product.create(data);
  await ActivityLog.create({ actor: req.user._id, action: id ? 'product_updated' : 'product_created', details: { productId: product._id, name: product.name } });
  res.status(id ? 200 : 201).json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { active: false });
  await ActivityLog.create({ actor: req.user._id, action: 'product_archived', details: { productId: req.params.id } });
  res.json({ ok: true });
});

/* ─── Users ─── */
export const allUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, search = '', role = '' } = req.query;
  const filter = {};
  if (role) filter.role = role;
  if (search) filter.$or = [
    { email: { $regex: search, $options: 'i' } },
    { name: { $regex: search, $options: 'i' } }
  ];

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * Number(limit)).limit(Number(limit)),
    User.countDocuments(filter)
  ]);

  // attach order count per user
  const ids = users.map((u) => u._id);
  const orderCounts = await Order.aggregate([
    { $match: { user: { $in: ids } } },
    { $group: { _id: '$user', count: { $sum: 1 }, spent: { $sum: '$total' } } }
  ]);
  const countMap = new Map(orderCounts.map((o) => [String(o._id), { count: o.count, spent: o.spent }]));

  const result = users.map((u) => ({
    _id: u._id, name: u.name, email: u.email, phone: u.phone,
    role: u.role, language: u.language, createdAt: u.createdAt,
    orders: countMap.get(String(u._id))?.count || 0,
    spent: countMap.get(String(u._id))?.spent || 0
  }));

  res.json({ users: result, total, page: Number(page) });
});

export const getUserDetail = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const orders = await Order.find({ user: user._id }).sort({ createdAt: -1 }).limit(20);
  const activity = await ActivityLog.find({ user: user._id }).sort({ createdAt: -1 }).limit(30);
  res.json({
    user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt },
    orders, activity
  });
});

export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) return res.status(422).json({ message: 'Invalid role' });
  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });
  await ActivityLog.create({ actor: req.user._id, user: user._id, action: 'user_role_updated', details: { role } });
  res.json({ user: { _id: user._id, name: user.name, email: user.email, role: user.role } });
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (String(req.params.id) === String(req.user._id))
    return res.status(400).json({ message: 'Cannot delete your own account' });
  await User.findByIdAndDelete(req.params.id);
  await ActivityLog.create({ actor: req.user._id, action: 'user_deleted', details: { userId: req.params.id } });
  res.json({ ok: true });
});

/* ─── Activity log ─── */
export const activityLog = asyncHandler(async (req, res) => {
  const { page = 1, limit = 40, action = '', userId = '' } = req.query;
  const filter = {};
  if (action) filter.action = { $regex: action, $options: 'i' };
  if (userId) filter.$or = [{ user: userId }, { actor: userId }];

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .populate('user', 'email name')
      .populate('actor', 'email name'),
    ActivityLog.countDocuments(filter)
  ]);
  res.json({ logs, total, page: Number(page) });
});
