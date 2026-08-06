import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import Order from '../models/Order.js';
import PaymentProof from '../models/PaymentProof.js';
import Account from '../models/Account.js';
import PaymentSetting from '../models/PaymentSetting.js';
import Notification from '../models/Notification.js';
import ActivityLog from '../models/ActivityLog.js';
import { asyncHandler } from '../middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');
const uploadDir = path.join(projectRoot, 'uploads', 'payments');

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const buildPaymentSettings = async () => {
  const existing = await PaymentSetting.findOne({ name: 'default' });
  if (existing) return existing;
  return PaymentSetting.create({
    name: 'default',
    paymentMethods: [
      { key: 'jazzcash', label: 'JazzCash', accountName: 'Rashid', mobileNumber: '03099966159', iban: 'PK87JCMA1304923099966159', instructions: 'Send the payment using the JazzCash details below and upload proof.' },
      { key: 'easypaisa', label: 'EasyPaisa', accountName: 'Rashid', mobileNumber: '03296799741', iban: 'PK84TMFB0000000080261863', instructions: 'Send the payment using the EasyPaisa details below and upload proof.' },
      { key: 'nayapay', label: 'NayaPay', accountName: 'Rashid', mobileNumber: '03099966159', iban: 'PK84NAYA1234503099966159', instructions: 'Send the payment using the NayaPay details below and upload proof.' },
      { key: 'ubl', label: 'UBL Bank', accountName: 'Rashid', accountNumber: '0109000322720202', iban: 'PK04UNIL0109000322720202', instructions: 'Transfer to the UBL account and upload proof.' },
      { key: 'mcb', label: 'MCB Bank', accountName: 'Rashid', accountNumber: '1598619911002778', instructions: 'Transfer to the MCB account and upload proof.' }
    ]
  });
};

const createNotification = async ({ user, type, title, message, data = {} }) => {
  if (!user) return null;
  return Notification.create({ user, type, title, message, data });
};

const createActivity = async ({ user, actor, action, details }) => {
  return ActivityLog.create({ user, actor, action, details });
};

const allowedExtensionSet = (extensions = []) => new Set(extensions.map((ext) => String(ext).toLowerCase()));

export const listPaymentMethods = asyncHandler(async (req, res) => {
  const settings = await buildPaymentSettings();
  res.json({ methods: settings.paymentMethods.filter((method) => method.active) });
});

export const submitPaymentProof = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  const settings = await buildPaymentSettings();

  const files = (req.files || []).map((file) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const allowed = allowedExtensionSet(settings.allowedExtensions);
    if (!allowed.has(ext)) throw Object.assign(new Error('Unsupported file format'), { status: 422 });
    const maxBytes = settings.maxFileSizeMB * 1024 * 1024;
    if (file.size > maxBytes) throw Object.assign(new Error('File exceeds the configured size limit'), { status: 413 });
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`;
    const targetPath = path.join(uploadDir, safeName);
    fs.writeFileSync(targetPath, file.buffer);
    return `/uploads/payments/${safeName}`;
  });

  if (!files.length) return res.status(422).json({ message: 'Please upload a payment proof file' });

  const existing = await PaymentProof.findOne({
    order: order._id,
    transactionId: { $regex: new RegExp(`^${(req.body.transactionId || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
  });
  if (existing && req.body.transactionId) return res.status(409).json({ message: 'A payment proof with this transaction ID already exists' });

  const proof = await PaymentProof.create({
    order: order._id,
    user: req.user?._id || order.user || null,
    paymentMethod: req.body.paymentMethod || order.paymentMethod,
    transactionId: req.body.transactionId || '',
    amountPaid: Number(req.body.amountPaid || 0),
    notes: req.body.notes || '',
    files,
    status: 'pending'
  });

  order.status = 'pending';
  order.paymentProofId = proof._id;
  await order.save();

  await createNotification({
    user: proof.user,
    type: 'payment-submitted',
    title: 'Payment submitted',
    message: settings.notificationTemplates.paymentSubmitted || 'Your payment has been received and is awaiting manual verification.'
  });
  await createActivity({ user: proof.user, actor: proof.user, action: 'payment_submitted', details: { orderId: order._id, proofId: proof._id } });

  res.status(201).json({ proof, order, message: 'Payment proof uploaded successfully' });
});

export const myPaymentProofs = asyncHandler(async (req, res) => {
  const proofs = await PaymentProof.find({ user: req.user._id }).sort({ createdAt: -1 }).populate('order', 'reference total paymentMethod status createdAt');
  res.json({ proofs });
});

export const pendingProofs = asyncHandler(async (req, res) => {
  const proofs = await PaymentProof.find({ status: 'pending' }).sort({ createdAt: -1 }).populate('order', 'reference total paymentMethod status createdAt').populate('user', 'name email');
  res.json({ proofs });
});

export const reviewPaymentProof = asyncHandler(async (req, res) => {
  const { action, rejectionReason, adminNotes } = req.body;
  const proof = await PaymentProof.findById(req.params.id).populate('order');
  if (!proof) return res.status(404).json({ message: 'Payment proof not found' });
  const settings = await buildPaymentSettings();

  if (action === 'approve') {
    proof.status = 'approved';
    proof.adminNotes = adminNotes || '';
    proof.reviewedBy = req.user._id;
    proof.reviewedAt = new Date();
    proof.rejectionReason = '';
    await proof.save();

    const order = proof.order;
    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        for (const item of order.items) {
          const account = await Account.findOneAndUpdate(
            { product: item.product, status: 'available' },
            { status: 'assigned', assignedTo: order._id, assignedAt: new Date() },
            { new: true, session, sort: { createdAt: 1 } }
          );
          if (!account) throw Object.assign(new Error(`${item.name} is out of stock`), { status: 409 });
          const expiresAt = new Date();
          expiresAt.setMonth(expiresAt.getMonth() + item.months);
          item.credentials = { login: account.login, password: account.password, profile: account.profile, expiresAt };
        }
        order.status = 'delivered';
        order.adminNotes = adminNotes || '';
        order.rejectionReason = '';
        await order.save({ session });
      });
    } finally {
      await session.endSession();
    }

    await createNotification({
      user: proof.user,
      type: 'payment-approved',
      title: 'Payment approved',
      message: settings.notificationTemplates.paymentApproved || 'Your payment has been approved.'
    });
    await createNotification({
      user: proof.user,
      type: 'subscription-activated',
      title: 'Subscription activated',
      message: `${settings.notificationTemplates.subscriptionActivated || 'Your subscription is now active.'} Reference ${order.reference}`
    });
    await createActivity({ user: proof.user, actor: req.user._id, action: 'payment_approved', details: { orderId: order._id, proofId: proof._id } });
    return res.json({ proof, message: 'Payment approved' });
  }

  if (action === 'reject') {
    if (!rejectionReason) return res.status(422).json({ message: 'A rejection reason is required' });
    proof.status = 'rejected';
    proof.adminNotes = adminNotes || '';
    proof.rejectionReason = rejectionReason;
    proof.reviewedBy = req.user._id;
    proof.reviewedAt = new Date();
    await proof.save();

    const order = proof.order;
    order.status = 'failed';
    order.adminNotes = adminNotes || '';
    order.rejectionReason = rejectionReason;
    await order.save();

    await createNotification({
      user: proof.user,
      type: 'payment-rejected',
      title: 'Payment rejected',
      message: `${settings.notificationTemplates.paymentRejected || 'Your payment has been rejected.'} Reason: ${rejectionReason}`
    });
    await createActivity({ user: proof.user, actor: req.user._id, action: 'payment_rejected', details: { orderId: order._id, proofId: proof._id, rejectionReason } });
    return res.json({ proof, message: 'Payment rejected' });
  }

  proof.status = 'pending';
  proof.adminNotes = adminNotes || '';
  proof.rejectionReason = '';
  proof.reviewedBy = req.user._id;
  proof.reviewedAt = new Date();
  await proof.save();
  return res.json({ proof, message: 'Payment left pending' });
});

export const getPaymentSettings = asyncHandler(async (req, res) => {
  const settings = await buildPaymentSettings();
  res.json({ settings });
});

export const updatePaymentSettings = asyncHandler(async (req, res) => {
  const settings = await PaymentSetting.findOneAndUpdate({ name: 'default' }, { $set: req.body }, { new: true, upsert: true });
  res.json({ settings });
});

export const listNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id, archived: false }).sort({ createdAt: -1 });
  res.json({ notifications });
});

export const markNotificationsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id }, { read: true });
  res.json({ ok: true });
});

export const deleteNotification = asyncHandler(async (req, res) => {
  await Notification.findOneAndUpdate({ _id: req.params.id, user: req.user._id }, { archived: true });
  res.json({ ok: true });
});
