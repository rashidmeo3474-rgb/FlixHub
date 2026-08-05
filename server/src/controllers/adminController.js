import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Account from '../models/Account.js';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.js';

export const stats = asyncHandler(async (req, res) => {
  const startOfDay = new Date(); startOfDay.setHours(0, 0, 0, 0);
  const [todayOrders, revenueAgg, stockAgg, customers] = await Promise.all([
    Order.countDocuments({ createdAt: { $gte: startOfDay }, status: { $in: ['paid', 'delivered'] } }),
    Order.aggregate([
      { $match: { createdAt: { $gte: startOfDay }, status: { $in: ['paid', 'delivered'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    Account.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: '$product', count: { $sum: 1 } } }
    ]),
    User.countDocuments({ role: 'user' })
  ]);

  const inStock = stockAgg.reduce((sum, s) => sum + s.count, 0);
  res.json({
    ordersToday: todayOrders,
    revenueToday: revenueAgg[0]?.total || 0,
    accountsInStock: inStock,
    lowStockProducts: stockAgg.filter((s) => s.count < 10).length,
    customers
  });
});

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
      available: pick('available'), assigned: pick('assigned'), active: p.active
    };
  });
  res.json({ stock: rows });
});

/** Bulk upload credentials: [{ login, password, profile }] */
export const addAccounts = asyncHandler(async (req, res) => {
  const { productId, accounts = [] } = req.body;
  if (!productId || !accounts.length) return res.status(422).json({ message: 'productId and accounts are required' });
  if (!(await Product.exists({ _id: productId }))) return res.status(404).json({ message: 'Product not found' });

  const docs = accounts
    .filter((a) => a.login && a.password)
    .map((a) => ({ product: productId, login: a.login.trim(), password: a.password, profile: a.profile || '' }));
  if (!docs.length) return res.status(422).json({ message: 'Each account needs a login and password' });

  const created = await Account.insertMany(docs);
  res.status(201).json({ added: created.length });
});

export const allOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 25 } = req.query;
  const filter = status ? { status } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(Number(limit)).populate('user', 'email name'),
    Order.countDocuments(filter)
  ]);
  res.json({ orders, total, page: Number(page) });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  res.json({ order });
});

export const upsertProduct = asyncHandler(async (req, res) => {
  const { id, ...data } = req.body;
  if (data.name && !data.slug) data.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const product = id
    ? await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    : await Product.create(data);
  res.status(id ? 200 : 201).json({ product });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await Product.findByIdAndUpdate(req.params.id, { active: false });
  res.json({ ok: true });
});
