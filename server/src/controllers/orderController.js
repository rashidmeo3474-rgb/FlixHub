import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Account from '../models/Account.js';
import { asyncHandler } from '../middleware/error.js';
import { createIntent, verifyPayment, isSupported } from '../services/payments.js';

const MULT = Product.MULTIPLIERS;

/** Build a validated order from the client cart — prices are recomputed server-side. */
export const createOrder = asyncHandler(async (req, res) => {
  const { items = [], paymentMethod, email, phone } = req.body;
  if (!items.length) return res.status(422).json({ message: 'Your cart is empty' });
  if (!isSupported(paymentMethod)) return res.status(422).json({ message: 'Choose a payment method' });
  if (!req.user && !email) return res.status(422).json({ message: 'Email is required for guest checkout' });

  const ids = items.map((i) => i.productId);
  
  // Fallback catalog uses slug as _id (string), real DB uses ObjectId — filter valid ObjectIds only
  const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
  
  // Fetch from DB first
  const products = validIds.length ? await Product.find({ _id: { $in: validIds }, active: true }) : [];
  const byId = new Map(products.map((p) => [String(p._id), p]));
  
  // If any IDs weren't found in DB, try fallback by slug
  const missingIds = ids.filter((id) => !byId.has(String(id)));
  if (missingIds.length) {
    const fallbackProducts = await Product.find({ slug: { $in: missingIds }, active: true });
    fallbackProducts.forEach((p) => byId.set(String(p._id), p));
    fallbackProducts.forEach((p) => byId.set(p.slug, p)); // also index by slug
  }

  const orderItems = items.map((i) => {
    const product = byId.get(String(i.productId));
    if (!product) throw Object.assign(new Error('A product in your cart is unavailable'), { status: 404 });
    const months = Number(i.months);
    if (!MULT[months]) throw Object.assign(new Error('Invalid duration'), { status: 422 });
    return {
      product: product._id, name: product.name, quality: product.quality,
      months, price: product.priceFor(months)
    };
  });

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
 * Mark paid and deliver automatically: pull available credentials out of the stock pool
 * inside a transaction so two buyers can never receive the same account.
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
          throw Object.assign(new Error(item.name + ' is out of stock — our team will restock shortly'), { status: 409 });
        }
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + item.months);
        item.credentials = {
          login: account.login, password: account.password,
          profile: account.profile, expiresAt
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

  // TODO: queue the same credentials to email / WhatsApp here.
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
