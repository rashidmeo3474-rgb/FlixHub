import mongoose from 'mongoose';
import Subscription from '../models/Subscription.js';
import Account     from '../models/Account.js';
import Order       from '../models/Order.js';
import Product     from '../models/Product.js';
import Notification from '../models/Notification.js';
import ActivityLog  from '../models/ActivityLog.js';
import { asyncHandler } from '../middleware/error.js';

/* ── helpers ── */
const notify = async (userId, type, title, message, data = {}) => {
  await Notification.create({ user: userId, type, title, message, data });
};

const refreshAll = async () => {
  const subs = await Subscription.find({
    status: { $nin: ['cancelled', 'expired'] },
    expiryDate: { $ne: null }
  });
  for (const s of subs) {
    const newStatus = s.refreshStatus();
    if (newStatus !== s.status) {
      if (newStatus === 'expired') {
        // release slot
        if (s.account && s.slotIndex != null) {
          await Account.findOneAndUpdate(
            { _id: s.account, 'slots.index': s.slotIndex },
            { $set: { 'slots.$.status': 'available', 'slots.$.assignedTo': null, 'slots.$.subscription': null, 'slots.$.assignedAt': null } }
          );
        }
        await ActivityLog.create({ action: 'subscription_expired', details: { subscriptionId: s._id } });
      }
      s.status = newStatus;
      await s.save();
    }
  }
};

/* ══════════════════ ADMIN ══════════════════ */

/** GET /api/subscriptions/admin — list all with filters */
export const adminListSubscriptions = asyncHandler(async (req, res) => {
  await refreshAll();
  const { status, search, page = 1, limit = 30 } = req.query;
  const filter = {};
  if (status) filter.status = status;

  let subs = await Subscription.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * Number(limit))
    .limit(Number(limit))
    .populate('user', 'name email phone')
    .populate('product', 'name quality accent')
    .populate('account', 'login totalSlots slots')
    .populate('order', 'reference total');

  if (search) {
    const q = search.toLowerCase();
    subs = subs.filter(s =>
      s.user?.email?.toLowerCase().includes(q) ||
      s.user?.name?.toLowerCase().includes(q) ||
      s.product?.name?.toLowerCase().includes(q) ||
      s.order?.reference?.toLowerCase().includes(q) ||
      String(s.slotIndex).includes(q)
    );
  }

  const total = await Subscription.countDocuments(filter);
  res.json({ subscriptions: subs, total, page: Number(page) });
});

/** GET /api/subscriptions/admin/pending — orders approved but not assigned */
export const pendingAssignments = asyncHandler(async (req, res) => {
  // Orders paid/delivered that have no subscription yet
  const assignedOrderIds = (await Subscription.distinct('order')).map(String);
  const orders = await Order.find({
    status: { $in: ['paid', 'delivered'] },
    _id: { $nin: assignedOrderIds }
  })
    .populate('user', 'name email')
    .populate('items.product', 'name quality accent slug')
    .sort({ createdAt: -1 });
  res.json({ orders });
});

/** GET /api/subscriptions/admin/inventory — service-wise slot summary */
export const inventorySummary = asyncHandler(async (req, res) => {
  const products = await Product.find({ active: true }, 'name quality accent slug');
  const result = [];
  for (const p of products) {
    const accounts = await Account.find({ product: p._id });
    const totalAccounts = accounts.length;
    const totalSlots    = accounts.reduce((s, a) => s + (a.totalSlots || 0), 0);
    const occupied      = accounts.reduce((s, a) => s + (a.slots?.filter(sl => sl.status === 'assigned').length || 0), 0);
    const available     = totalSlots - occupied;
    result.push({ product: p, totalAccounts, totalSlots, occupied, available });
  }
  res.json({ inventory: result });
});

/** POST /api/subscriptions/admin/assign — assign order → account → slot */
export const assignSubscription = asyncHandler(async (req, res) => {
  const { orderId, accountId, slotIndex, productId, months, adminNotes = '' } = req.body;
  if (!orderId || !accountId || !slotIndex)
    return res.status(422).json({ message: 'orderId, accountId and slotIndex are required' });

  const session = await mongoose.startSession();
  let sub;
  try {
    await session.withTransaction(async () => {
      const account = await Account.findById(accountId).session(session);
      if (!account) throw Object.assign(new Error('Account not found'), { status: 404 });

      const slot = account.slots.find(s => s.index === Number(slotIndex));
      if (!slot) throw Object.assign(new Error('Slot not found'), { status: 404 });
      if (slot.status === 'assigned') throw Object.assign(new Error('This slot is no longer available'), { status: 409 });

      const order = await Order.findById(orderId).session(session);
      if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });

      const numMonths = months || (order.items?.[0]?.months) || 1;
      const startDate  = new Date();
      const expiryDate = new Date(startDate);
      expiryDate.setDate(expiryDate.getDate() + numMonths * 30);

      // Mark slot as assigned
      await Account.findOneAndUpdate(
        { _id: accountId, 'slots.index': Number(slotIndex) },
        { $set: {
          'slots.$.status':       'assigned',
          'slots.$.assignedTo':   order.user,
          'slots.$.assignedAt':   startDate,
        }},
        { session }
      );

      sub = await Subscription.create([{
        user:       order.user,
        order:      orderId,
        product:    productId || order.items?.[0]?.product,
        account:    accountId,
        slotIndex:  Number(slotIndex),
        slotLabel:  slot.label || `Profile ${slotIndex}`,
        startDate,
        expiryDate,
        status:     'active',
        adminNotes,
      }], { session });
      sub = sub[0];
    });
  } finally {
    await session.endSession();
  }

  // notify customer
  if (sub?.user) {
    await notify(sub.user, 'subscription_assigned', 'Subscription Activated',
      'Your subscription has been assigned. Check My Subscriptions for details.',
      { subscriptionId: sub._id });
  }
  await ActivityLog.create({ actor: req.user._id, user: sub?.user, action: 'slot_assigned',
    details: { accountId, slotIndex, subscriptionId: sub?._id } });

  res.status(201).json({ subscription: sub });
});

/** GET /api/subscriptions/admin/:id — single subscription detail */
export const adminGetSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('product', 'name quality accent logo')
    .populate('account', 'login password totalSlots slots')
    .populate('order', 'reference total paymentMethod createdAt');
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });
  res.json({ subscription: sub });
});

/** PATCH /api/subscriptions/admin/:id/renew */
export const renewSubscription = asyncHandler(async (req, res) => {
  const { days = 30, note = '' } = req.body;
  const sub = await Subscription.findById(req.params.id);
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });

  const oldExpiry  = sub.expiryDate || new Date();
  const base       = oldExpiry > new Date() ? oldExpiry : new Date();
  const newExpiry  = new Date(base);
  newExpiry.setDate(newExpiry.getDate() + Number(days));

  sub.renewals.push({ renewedBy: req.user._id, oldExpiry, newExpiry, daysAdded: Number(days), note });
  sub.expiryDate = newExpiry;
  sub.status     = sub.refreshStatus();
  await sub.save();

  if (sub.user) {
    await notify(sub.user, 'subscription_renewed', 'Subscription Renewed',
      `Your subscription has been renewed for ${days} days.`,
      { subscriptionId: sub._id, newExpiry });
  }
  await ActivityLog.create({ actor: req.user._id, user: sub.user, action: 'subscription_renewed',
    details: { subscriptionId: sub._id, days, newExpiry } });

  res.json({ subscription: sub });
});

/** PATCH /api/subscriptions/admin/:id/cancel */
export const cancelSubscription = asyncHandler(async (req, res) => {
  const sub = await Subscription.findById(req.params.id);
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });

  if (sub.account && sub.slotIndex != null) {
    await Account.findOneAndUpdate(
      { _id: sub.account, 'slots.index': sub.slotIndex },
      { $set: { 'slots.$.status': 'available', 'slots.$.assignedTo': null,
                'slots.$.subscription': null, 'slots.$.assignedAt': null } }
    );
  }
  sub.status      = 'cancelled';
  sub.cancelledAt = new Date();
  await sub.save();

  await ActivityLog.create({ actor: req.user._id, action: 'subscription_cancelled',
    details: { subscriptionId: sub._id } });
  res.json({ subscription: sub });
});

/* ══════════════════ ACCOUNT / SLOT MANAGER ══════════════════ */

/** GET /api/subscriptions/admin/accounts — all accounts with slot details */
export const adminListAccounts = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const filter = productId ? { product: productId } : {};
  const accounts = await Account.find(filter)
    .populate('product', 'name quality accent slug')
    .sort({ createdAt: -1 });
  res.json({ accounts });
});

/** PATCH /api/subscriptions/admin/accounts/:id — update totalSlots / note */
export const adminUpdateAccount = asyncHandler(async (req, res) => {
  const { totalSlots, note } = req.body;
  const account = await Account.findById(req.params.id);
  if (!account) return res.status(404).json({ message: 'Account not found' });
  if (totalSlots != null) account.totalSlots = Number(totalSlots);
  if (note       != null) account.note       = note;
  await account.save(); // pre-save hook syncs slots[]
  await ActivityLog.create({ actor: req.user._id, action: 'account_updated',
    details: { accountId: account._id, totalSlots: account.totalSlots } });
  res.json({ account });
});

/** GET /api/subscriptions/admin/available-slots — all available slots across accounts */
export const availableSlots = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const filter = productId ? { product: productId } : {};
  const accounts = await Account.find(filter).populate('product', 'name quality accent slug');
  const result = [];
  for (const acc of accounts) {
    for (const slot of (acc.slots || [])) {
      if (slot.status === 'available') {
        result.push({
          accountId:   acc._id,
          accountLogin: acc.login,
          product:     acc.product,
          slotIndex:   slot.index,
          slotLabel:   slot.label,
        });
      }
    }
  }
  res.json({ slots: result, total: result.length });
});

/* ══════════════════ CUSTOMER ══════════════════ */

/** GET /api/subscriptions/mine — customer's own subscriptions */
export const mySubscriptions = asyncHandler(async (req, res) => {
  await refreshAll();
  const subs = await Subscription.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate('product', 'name quality accent logo slug')
    .populate('account', 'login password totalSlots')
    .populate('order', 'reference total');
  res.json({ subscriptions: subs });
});

/** GET /api/subscriptions/mine/:id — single subscription (owner only) */
export const mySubscriptionDetail = asyncHandler(async (req, res) => {
  const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id })
    .populate('product', 'name quality accent logo slug')
    .populate('account', 'login password totalSlots slots')
    .populate('order', 'reference total');
  if (!sub) return res.status(404).json({ message: 'Subscription not found' });
  res.json({ subscription: sub });
});
