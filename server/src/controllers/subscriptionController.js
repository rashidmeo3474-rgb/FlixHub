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

/** PATCH /api/subscriptions/admin/accounts/:id — update account fields */
export const adminUpdateAccount = asyncHandler(async (req, res) => {
  const { totalSlots, note, plan, purchaseDate, providerExpiryDate, accountStatus, login, password } = req.body;
  const account = await Account.findById(req.params.id);
  if (!account) return res.status(404).json({ message: 'Account not found' });

  if (totalSlots          != null) account.totalSlots          = Number(totalSlots);
  if (note                != null) account.note                = note;
  if (plan                != null) account.plan                = plan;
  if (purchaseDate        != null) account.purchaseDate        = purchaseDate ? new Date(purchaseDate) : null;
  if (providerExpiryDate  != null) account.providerExpiryDate  = providerExpiryDate ? new Date(providerExpiryDate) : null;
  if (accountStatus       != null) account.accountStatus       = accountStatus;
  if (login               != null) account.login               = login.trim();
  if (password            != null) account.password            = password;

  await account.save(); // pre-save hook syncs slots[] and refreshes accountStatus
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

/* ══════════════════ SUBSCRIPTION INVENTORY ══════════════════ */

/**
 * POST /api/subscriptions/admin/inventory/accounts
 * Add a full purchased account to the inventory.
 * This is distinct from StockManager's bulk credential upload —
 * here the admin adds ONE full purchased account with all its metadata.
 */
export const inventoryAddAccount = asyncHandler(async (req, res) => {
  const {
    productId, plan = '', login, password,
    purchaseDate, providerExpiryDate, totalSlots = 1, note = ''
  } = req.body;

  if (!productId) return res.status(422).json({ message: 'productId is required' });
  if (!login)     return res.status(422).json({ message: 'Account email / login is required' });
  if (!password)  return res.status(422).json({ message: 'Account password is required' });

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const account = new Account({
    product:           productId,
    login:             login.trim(),
    password,
    plan,
    purchaseDate:      purchaseDate      ? new Date(purchaseDate)      : null,
    providerExpiryDate: providerExpiryDate ? new Date(providerExpiryDate) : null,
    totalSlots:        Number(totalSlots),
    note,
    status:            'available',
  });

  await account.save();

  await ActivityLog.create({
    actor:   req.user._id,
    action:  'inventory_account_added',
    details: { accountId: account._id, productId, login: account.login },
  });

  res.status(201).json({ account });
});

/**
 * DELETE /api/subscriptions/admin/inventory/accounts/:id
 * Remove a full purchased account from inventory.
 * Blocked if any slot is currently occupied.
 */
export const inventoryDeleteAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id);
  if (!account) return res.status(404).json({ message: 'Account not found' });

  const hasOccupied = (account.slots || []).some(s => s.status === 'assigned');
  if (hasOccupied) {
    return res.status(409).json({
      message: 'Cannot delete account: one or more slots are currently occupied by customers. Unassign them first.',
    });
  }

  await Account.findByIdAndDelete(req.params.id);

  await ActivityLog.create({
    actor:   req.user._id,
    action:  'inventory_account_deleted',
    details: { accountId: req.params.id },
  });

  res.json({ ok: true });
});

/**
 * GET /api/subscriptions/admin/inventory/summary
 * Service-wise summary: full accounts count, total slots, occupied, available.
 * Includes provider expiry status per account.
 */
export const inventoryFullSummary = asyncHandler(async (req, res) => {
  const products = await Product.find({ active: true }, 'name quality accent slug logo');
  const result = [];

  for (const p of products) {
    const accounts = await Account.find({ product: p._id })
      .populate('slots');

    // Refresh accountStatus on each account (in memory only — no save overhead)
    const enriched = accounts.map(a => {
      const status = a.refreshAccountStatus();
      return {
        _id:                a._id,
        login:              a.login,
        plan:               a.plan,
        purchaseDate:       a.purchaseDate,
        providerExpiryDate: a.providerExpiryDate,
        accountStatus:      status,
        totalSlots:         a.totalSlots,
        occupied:           (a.slots || []).filter(s => s.status === 'assigned').length,
        available:          (a.slots || []).filter(s => s.status === 'available').length,
        note:               a.note,
        createdAt:          a.createdAt,
      };
    });

    const totalAccounts = enriched.length;
    const totalSlots    = enriched.reduce((s, a) => s + a.totalSlots, 0);
    const occupied      = enriched.reduce((s, a) => s + a.occupied, 0);
    const available     = enriched.reduce((s, a) => s + a.available, 0);

    result.push({
      product:      { _id: p._id, name: p.name, quality: p.quality, accent: p.accent, slug: p.slug, logo: p.logo },
      totalAccounts,
      totalSlots,
      occupied,
      available,
      accounts:     enriched,
    });
  }

  res.json({ inventory: result });
});

/**
 * GET /api/subscriptions/admin/inventory/accounts
 * Full list of all inventory accounts with slot details + subscription info per slot.
 * Supports ?productId, ?accountStatus, ?search filters.
 */
export const inventoryListAccounts = asyncHandler(async (req, res) => {
  const { productId, accountStatus, search } = req.query;
  const filter = {};
  if (productId)     filter.product       = productId;
  if (accountStatus) filter.accountStatus = accountStatus;

  let accounts = await Account.find(filter)
    .populate('product', 'name quality accent slug logo')
    .sort({ createdAt: -1 });

  // Attach per-slot subscription + user info
  const accountIds = accounts.map(a => a._id);
  const subs = await Subscription.find({ account: { $in: accountIds }, status: { $ne: 'cancelled' } })
    .populate('user', 'name email')
    .populate('product', 'name');

  // Build a lookup: accountId → slotIndex → subscription
  const subMap = new Map();
  for (const s of subs) {
    const key = `${s.account}:${s.slotIndex}`;
    subMap.set(key, s);
  }

  // Inline filter by search
  if (search) {
    const q = search.toLowerCase();
    accounts = accounts.filter(a =>
      a.login.toLowerCase().includes(q) ||
      a.product?.name?.toLowerCase().includes(q) ||
      a.plan?.toLowerCase().includes(q)
    );
  }

  const result = accounts.map(a => {
    const refreshed = a.refreshAccountStatus();
    const slotsEnriched = (a.slots || []).map(sl => {
      const sub = subMap.get(`${a._id}:${sl.index}`);
      return {
        index:          sl.index,
        label:          sl.label,
        pin:            sl.pin,
        status:         sl.status,
        assignedTo:     sl.assignedTo,
        assignedAt:     sl.assignedAt,
        // customer subscription detail
        subscription:   sub ? {
          _id:           sub._id,
          customerName:  sub.user?.name || sub.user?.email || '—',
          customerEmail: sub.user?.email || '—',
          startDate:     sub.startDate,
          expiryDate:    sub.expiryDate,
          status:        sub.status,
        } : null,
      };
    });

    return {
      _id:                a._id,
      product:            a.product,
      login:              a.login,
      password:           a.password,   // included for admin only — never expose via public API
      plan:               a.plan,
      purchaseDate:       a.purchaseDate,
      providerExpiryDate: a.providerExpiryDate,
      accountStatus:      refreshed,
      totalSlots:         a.totalSlots,
      occupied:           slotsEnriched.filter(s => s.status === 'assigned').length,
      available:          slotsEnriched.filter(s => s.status === 'available').length,
      note:               a.note,
      slots:              slotsEnriched,
      createdAt:          a.createdAt,
    };
  });

  res.json({ accounts: result, total: result.length });
});

/**
 * GET /api/subscriptions/admin/inventory/accounts/:id
 * Single account full detail.
 */
export const inventoryGetAccount = asyncHandler(async (req, res) => {
  const account = await Account.findById(req.params.id)
    .populate('product', 'name quality accent slug logo');
  if (!account) return res.status(404).json({ message: 'Account not found' });

  const subs = await Subscription.find({ account: account._id, status: { $ne: 'cancelled' } })
    .populate('user', 'name email phone')
    .populate('product', 'name');

  const subMap = new Map(subs.map(s => [`${s.slotIndex}`, s]));

  const slotsEnriched = (account.slots || []).map(sl => {
    const sub = subMap.get(String(sl.index));
    return {
      index:       sl.index,
      label:       sl.label,
      pin:         sl.pin,
      status:      sl.status,
      assignedTo:  sl.assignedTo,
      assignedAt:  sl.assignedAt,
      subscription: sub ? {
        _id:           sub._id,
        customerName:  sub.user?.name || sub.user?.email || '—',
        customerEmail: sub.user?.email || '—',
        customerPhone: sub.user?.phone || '',
        startDate:     sub.startDate,
        expiryDate:    sub.expiryDate,
        status:        sub.status,
      } : null,
    };
  });

  res.json({
    account: {
      _id:                account._id,
      product:            account.product,
      login:              account.login,
      password:           account.password,
      plan:               account.plan,
      purchaseDate:       account.purchaseDate,
      providerExpiryDate: account.providerExpiryDate,
      accountStatus:      account.refreshAccountStatus(),
      totalSlots:         account.totalSlots,
      occupied:           slotsEnriched.filter(s => s.status === 'assigned').length,
      available:          slotsEnriched.filter(s => s.status === 'available').length,
      note:               account.note,
      slots:              slotsEnriched,
      createdAt:          account.createdAt,
    }
  });
});

/**
 * GET /api/subscriptions/admin/inventory/available
 * All available slots across all accounts, grouped by service.
 * Used for the "Available Inventory" quick-assign view.
 */
export const inventoryAvailableSlots = asyncHandler(async (req, res) => {
  const { productId } = req.query;
  const filter = productId ? { product: productId } : {};
  const accounts = await Account.find(filter)
    .populate('product', 'name quality accent slug logo');

  // Build a sequential account number per product
  const productSeq = {};
  const result = [];

  for (const acc of accounts) {
    const pid = String(acc.product?._id || acc.product);
    productSeq[pid] = (productSeq[pid] || 0) + 1;
    const seq = productSeq[pid];

    const availableSlots = (acc.slots || []).filter(s => s.status === 'available');
    for (const sl of availableSlots) {
      result.push({
        accountId:          acc._id,
        accountSeq:         seq,
        accountLogin:       acc.login,
        providerExpiryDate: acc.providerExpiryDate,
        accountStatus:      acc.refreshAccountStatus(),
        product:            acc.product,
        slotIndex:          sl.index,
        slotLabel:          sl.label || `Profile ${sl.index}`,
      });
    }
  }

  res.json({ slots: result, total: result.length });
});

/**
 * POST /api/subscriptions/admin/inventory/assign-slot
 * Assign an available inventory slot directly to a customer (without an order).
 * Stores customer start/expiry separately from provider expiry.
 */
export const inventoryAssignSlot = asyncHandler(async (req, res) => {
  const {
    accountId, slotIndex, userId,
    customerStartDate, customerExpiryDate, adminNotes = ''
  } = req.body;

  if (!accountId || !slotIndex || !userId)
    return res.status(422).json({ message: 'accountId, slotIndex and userId are required' });
  if (!customerExpiryDate)
    return res.status(422).json({ message: 'customerExpiryDate is required' });

  const session = await mongoose.startSession();
  let sub;
  try {
    await session.withTransaction(async () => {
      const account = await Account.findById(accountId).session(session);
      if (!account) throw Object.assign(new Error('Account not found'), { status: 404 });

      const slot = account.slots.find(s => s.index === Number(slotIndex));
      if (!slot) throw Object.assign(new Error('Slot not found'), { status: 404 });
      if (slot.status === 'assigned')
        throw Object.assign(new Error('Slot is no longer available'), { status: 409 });

      const user = await (await import('../models/User.js')).default.findById(userId).session(session);
      if (!user) throw Object.assign(new Error('Customer not found'), { status: 404 });

      const startDate  = customerStartDate ? new Date(customerStartDate) : new Date();
      const expiryDate = new Date(customerExpiryDate);

      // Mark slot as assigned
      await Account.findOneAndUpdate(
        { _id: accountId, 'slots.index': Number(slotIndex) },
        { $set: {
          'slots.$.status':     'assigned',
          'slots.$.assignedTo': userId,
          'slots.$.assignedAt': startDate,
        }},
        { session }
      );

      // Create a subscription record (no order reference — direct inventory assignment)
      sub = await Subscription.create([{
        user:       userId,
        order:      null,
        product:    account.product,
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

  if (sub?.user) {
    await notify(sub.user, 'subscription_assigned', 'Subscription Activated',
      'Your subscription has been assigned. Check My Subscriptions for details.',
      { subscriptionId: sub._id });
  }

  await ActivityLog.create({
    actor:   req.user._id,
    user:    userId,
    action:  'inventory_slot_assigned',
    details: { accountId, slotIndex, subscriptionId: sub?._id, userId },
  });

  res.status(201).json({ subscription: sub });
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
