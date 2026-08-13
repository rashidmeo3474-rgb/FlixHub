import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Account from '../models/Account.js';
import { asyncHandler } from '../middleware/error.js';
import { createIntent, verifyPayment, isSupported } from '../services/payments.js';

const MULT = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };

const FALLBACK_CATALOG = [
  /* 480p SD */
  { name: 'Netflix',             quality: '480p SD',  monthlyPrice: 300,  compareAt: 400,  accent: '#e50914', category: 'movies', slug: 'netflix-480p' },
  { name: 'Prime Video',         quality: '480p SD',  monthlyPrice: 250,  compareAt: 350,  accent: '#00a8e1', category: 'movies', slug: 'prime-480p' },
  { name: 'Disney+',             quality: '480p SD',  monthlyPrice: 280,  compareAt: 380,  accent: '#4b6cf7', category: 'movies', slug: 'disney-480p' },
  { name: 'HBO Max',             quality: '480p SD',  monthlyPrice: 300,  compareAt: 400,  accent: '#9b30ff', category: 'movies', slug: 'hbo-480p' },
  /* 720p HD */
  { name: 'Netflix',             quality: '720p HD',  monthlyPrice: 380,  compareAt: 500,  accent: '#e50914', category: 'movies', slug: 'netflix-720p' },
  { name: 'Prime Video',         quality: '720p HD',  monthlyPrice: 300,  compareAt: 420,  accent: '#00a8e1', category: 'movies', slug: 'prime-720p' },
  { name: 'Disney+',             quality: '720p HD',  monthlyPrice: 340,  compareAt: 460,  accent: '#4b6cf7', category: 'movies', slug: 'disney-720p' },
  { name: 'HBO Max',             quality: '720p HD',  monthlyPrice: 380,  compareAt: 500,  accent: '#9b30ff', category: 'movies', slug: 'hbo-720p' },
  /* 1080p HD */
  { name: 'Netflix',             quality: '1080p HD', monthlyPrice: 450,  compareAt: 600,  accent: '#e50914', category: 'movies', slug: 'netflix' },
  { name: 'Prime Video',         quality: '1080p HD', monthlyPrice: 350,  compareAt: 500,  accent: '#00a8e1', category: 'movies', slug: 'prime-video' },
  { name: 'Disney+',             quality: '1080p HD', monthlyPrice: 400,  compareAt: 550,  accent: '#4b6cf7', category: 'movies', slug: 'disney' },
  { name: 'HBO Max',             quality: '1080p HD', monthlyPrice: 450,  compareAt: 600,  accent: '#9b30ff', category: 'movies', slug: 'hbo-max' },
  { name: 'Apple TV+',           quality: '1080p HD', monthlyPrice: 1800, compareAt: 2500, accent: '#d8d8d8', category: 'movies', slug: 'apple-tv-1080p' },
  /* 4K UHD */
  { name: 'Netflix',             quality: '4K UHD',   monthlyPrice: 550,  compareAt: 750,  accent: '#e50914', category: 'movies', slug: 'netflix-4k' },
  { name: 'Prime Video',         quality: '4K UHD',   monthlyPrice: 450,  compareAt: 650,  accent: '#00a8e1', category: 'movies', slug: 'prime-4k' },
  { name: 'Disney+',             quality: '4K UHD',   monthlyPrice: 500,  compareAt: 700,  accent: '#4b6cf7', category: 'movies', slug: 'disney-4k' },
  { name: 'HBO Max',             quality: '4K UHD',   monthlyPrice: 550,  compareAt: 750,  accent: '#9b30ff', category: 'movies', slug: 'hbo-4k' },
  { name: 'Apple TV+',           quality: '4K UHD',   monthlyPrice: 2200, compareAt: 3000, accent: '#d8d8d8', category: 'movies', slug: 'apple-tv' },
  /* 8K UHD */
  { name: 'Apple TV+',           quality: '8K UHD',   monthlyPrice: 2700, compareAt: 4000, accent: '#d8d8d8', category: 'movies', slug: 'apple-tv-8k' },
  { name: 'Netflix',             quality: '8K UHD',   monthlyPrice: 650,  compareAt: 900,  accent: '#e50914', category: 'movies', slug: 'netflix-8k' },
  { name: 'HBO Max',             quality: '8K UHD',   monthlyPrice: 650,  compareAt: 900,  accent: '#9b30ff', category: 'movies', slug: 'hbo-8k' },
  /* Bundles */
  { name: 'Netflix + Prime Video', quality: '4K UHD', monthlyPrice: 600,  compareAt: 1000, accent: '#e50914', category: 'bundle', slug: 'netflix-prime' },
];

/** 
 * Resolve productId to a real Product document.
 * productId can be a MongoDB ObjectId string OR a slug (from fallback catalog).
 * If product doesn't exist in DB yet, auto-create it from the fallback catalog.
 */
const resolveProduct = async (productId) => {
  // 1. Try by ObjectId
  if (mongoose.Types.ObjectId.isValid(productId)) {
    const byId = await Product.findOne({ _id: productId, active: true });
    if (byId) return byId;
  }

  // 2. Try by slug
  const bySlug = await Product.findOne({ slug: productId, active: true });
  if (bySlug) return bySlug;

  // 3. Auto-seed from fallback catalog so future orders work too
  const template = FALLBACK_CATALOG.find((p) => p.slug === productId);
  if (template) {
    const created = await Product.findOneAndUpdate(
      { slug: template.slug },
      { ...template, active: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return created;
  }

  return null;
};

/** Build a validated order from the client cart — prices are recomputed server-side. */
export const createOrder = asyncHandler(async (req, res) => {
  const { items = [], paymentMethod, email, phone } = req.body;
  if (!items.length) return res.status(422).json({ message: 'Your cart is empty' });
  if (!isSupported(paymentMethod)) return res.status(422).json({ message: 'Choose a payment method' });
  if (!req.user && !email) return res.status(422).json({ message: 'Email is required for guest checkout' });

  const orderItems = [];
  for (const i of items) {
    const product = await resolveProduct(String(i.productId));
    if (!product) throw Object.assign(new Error('A product in your cart is unavailable'), { status: 404 });

    const months = Number(i.months);
    if (!MULT[months]) throw Object.assign(new Error('Invalid duration selected'), { status: 422 });

    const price = product.priceFor
      ? product.priceFor(months)
      : Math.round(product.monthlyPrice * MULT[months]);

    orderItems.push({
      product: product._id,
      name: product.name,
      quality: product.quality,
      months,
      price
    });
  }

  const total = orderItems.reduce((sum, i) => sum + i.price, 0);
  const order = await Order.create({
    user: req.user?._id || null,
    guestEmail: req.user?.email || email,
    phone: phone || req.user?.phone || '',
    items: orderItems, total, paymentMethod, status: 'pending'
  });

  const intent = await createIntent({ method: paymentMethod, amount: total, reference: order.reference });
  res.status(201).json({ order, intent });
});

/**
 * Mark paid and deliver automatically — pull available credentials out of stock
 * inside a transaction so two buyers never get the same account.
 */
export const payOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.user && req.user && String(order.user) !== String(req.user._id) && req.user.role !== 'admin')
    return res.status(403).json({ message: 'Not your order' });
  if (order.status === 'delivered') return res.json({ order });

  const payment = await verifyPayment({ intentId: req.body.intentId, providerRef: req.body.providerRef });
  if (!payment.success) {
    order.status = 'failed';
    await order.save();
    return res.status(402).json({ message: 'Payment was not completed' });
  }

  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      for (const item of order.items) {
        const account = await Account.findOneAndUpdate(
          { product: item.product, status: 'available' },
          { status: 'assigned', assignedTo: order._id, assignedAt: new Date() },
          { new: true, session, sort: { createdAt: 1 } }
        );
        if (!account) {
          throw Object.assign(
            new Error(`${item.name} is temporarily unavailable. New stock will be added within 24 hours.`),
            { status: 409 }
          );
        }
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + item.months);
        item.credentials = {
          login: account.login,
          password: account.password,
          profile: account.profile,
          expiresAt
        };
      }
      order.status = 'delivered';
      order.paymentRef = payment.paymentRef;
      order.deliveredAt = new Date();
      await order.save({ session });
    });
  } finally {
    await session.endSession();
  }

  res.json({ order });
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ orders });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ reference: req.params.reference });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const owns = req.user && (String(order.user) === String(req.user._id) || req.user.role === 'admin');
  if (order.user && !owns) return res.status(403).json({ message: 'Not your order' });
  res.json({ order });
});
