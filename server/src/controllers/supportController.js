import SupportConversation from '../models/SupportConversation.js';
import SupportMessage      from '../models/SupportMessage.js';
import Subscription        from '../models/Subscription.js';
import Notification        from '../models/Notification.js';
import ActivityLog         from '../models/ActivityLog.js';
import User                from '../models/User.js';
import { asyncHandler }    from '../middleware/error.js';

const notify = async (userId, type, title, message, data = {}) => {
  try { await Notification.create({ user: userId, type, title, message, data }); } catch {}
};

/* ══════════════════ CUSTOMER ══════════════════ */

/** POST /api/support/conversations — open new conversation */
export const createConversation = asyncHandler(async (req, res) => {
  const { subscriptionId, subject, body } = req.body;
  if (!body?.trim()) return res.status(422).json({ message: 'Message body is required' });

  let ctx = {};
  if (subscriptionId) {
    const sub = await Subscription.findOne({ _id: subscriptionId, user: req.user._id })
      .populate('account').populate('order').populate('product');
    if (sub) {
      ctx = {
        subscription: sub._id,
        order:        sub.order?._id,
        product:      sub.product?._id,
        account:      sub.account?._id,
        slotIndex:    sub.slotIndex,
      };
    }
  }

  const convo = await SupportConversation.create({
    user: req.user._id, subject: subject || 'Support Request',
    status: 'open', unreadAdmin: 1, lastMessageAt: new Date(), ...ctx,
  });

  await SupportMessage.create({
    conversation: convo._id,
    sender: req.user._id,
    senderRole: 'user',
    body: body.trim(),
    readByAdmin: false,
    readByCustomer: true,
  });

  await ActivityLog.create({ user: req.user._id, action: 'support_message_received',
    details: { conversationId: convo._id } });

  res.status(201).json({ conversation: convo });
});

/** GET /api/support/conversations — customer's own conversations */
export const myConversations = asyncHandler(async (req, res) => {
  const convos = await SupportConversation.find({ user: req.user._id })
    .sort({ lastMessageAt: -1 })
    .populate('subscription', 'slotIndex slotLabel status expiryDate')
    .populate('product', 'name quality accent')
    .populate('account', 'login');
  res.json({ conversations: convos });
});

/** GET /api/support/conversations/:id — single conversation + messages (owner only) */
export const getConversation = asyncHandler(async (req, res) => {
  const convo = await SupportConversation.findOne({ _id: req.params.id, user: req.user._id })
    .populate('subscription', 'slotIndex slotLabel status expiryDate startDate')
    .populate('product', 'name quality accent logo')
    .populate('account', 'login')
    .populate('order', 'reference total')
    .populate('user', 'name email');
  if (!convo) return res.status(404).json({ message: 'Conversation not found' });

  const messages = await SupportMessage.find({ conversation: convo._id })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email role');

  // mark as read by customer
  await SupportMessage.updateMany(
    { conversation: convo._id, readByCustomer: false },
    { $set: { readByCustomer: true } }
  );
  await SupportConversation.findByIdAndUpdate(convo._id, { $set: { unreadCustomer: 0 } });

  res.json({ conversation: convo, messages });
});

/** POST /api/support/conversations/:id/messages — customer replies */
export const customerReply = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(422).json({ message: 'Message body is required' });

  const convo = await SupportConversation.findOne({ _id: req.params.id, user: req.user._id });
  if (!convo) return res.status(404).json({ message: 'Conversation not found' });
  if (convo.status === 'resolved') return res.status(400).json({ message: 'Conversation is resolved' });

  const msg = await SupportMessage.create({
    conversation: convo._id,
    sender: req.user._id,
    senderRole: 'user',
    body: body.trim(),
    readByAdmin: false,
    readByCustomer: true,
  });

  await SupportConversation.findByIdAndUpdate(convo._id, {
    $inc: { unreadAdmin: 1 },
    $set: { status: 'open', lastMessageAt: new Date() }
  });

  // find any admin to notify
  const admin = await User.findOne({ role: 'admin' });
  if (admin) {
    await notify(admin._id, 'support_message', 'New Support Message',
      `Customer sent a message: "${body.slice(0, 60)}"`,
      { conversationId: convo._id });
  }
  await ActivityLog.create({ user: req.user._id, action: 'support_message_received',
    details: { conversationId: convo._id } });

  res.status(201).json({ message: msg });
});

/* ══════════════════ ADMIN ══════════════════ */

/** GET /api/support/admin/conversations — all conversations */
export const adminListConversations = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 30 } = req.query;
  const filter = status ? { status } : {};
  const [convos, total] = await Promise.all([
    SupportConversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit))
      .populate('user', 'name email')
      .populate('product', 'name quality accent')
      .populate('account', 'login')
      .populate('subscription', 'slotIndex slotLabel status expiryDate'),
    SupportConversation.countDocuments(filter)
  ]);
  const totalUnread = await SupportConversation.aggregate([
    { $group: { _id: null, sum: { $sum: '$unreadAdmin' } } }
  ]);
  res.json({ conversations: convos, total, page: Number(page),
    totalUnread: totalUnread[0]?.sum || 0 });
});

/** GET /api/support/admin/conversations/:id — conversation detail + messages */
export const adminGetConversation = asyncHandler(async (req, res) => {
  const convo = await SupportConversation.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('product', 'name quality accent logo')
    .populate('account', 'login')
    .populate('order', 'reference total createdAt')
    .populate('subscription', 'slotIndex slotLabel status expiryDate startDate remainingDays');
  if (!convo) return res.status(404).json({ message: 'Conversation not found' });

  const messages = await SupportMessage.find({ conversation: convo._id })
    .sort({ createdAt: 1 })
    .populate('sender', 'name email role');

  // mark read by admin
  await SupportMessage.updateMany(
    { conversation: convo._id, readByAdmin: false },
    { $set: { readByAdmin: true } }
  );
  await SupportConversation.findByIdAndUpdate(convo._id, { $set: { unreadAdmin: 0 } });

  res.json({ conversation: convo, messages });
});

/** POST /api/support/admin/conversations/:id/reply */
export const adminReply = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body?.trim()) return res.status(422).json({ message: 'Message body is required' });

  const convo = await SupportConversation.findById(req.params.id);
  if (!convo) return res.status(404).json({ message: 'Conversation not found' });

  const msg = await SupportMessage.create({
    conversation: convo._id,
    sender: req.user._id,
    senderRole: 'admin',
    body: body.trim(),
    readByAdmin: true,
    readByCustomer: false,
  });

  await SupportConversation.findByIdAndUpdate(convo._id, {
    $inc: { unreadCustomer: 1 },
    $set: { status: 'waiting_customer', lastMessageAt: new Date() }
  });

  // notify customer
  await notify(convo.user, 'support_reply', 'Admin replied to your support message',
    `"${body.slice(0, 60)}"`, { conversationId: convo._id });

  await ActivityLog.create({ actor: req.user._id, user: convo.user, action: 'support_reply_sent',
    details: { conversationId: convo._id } });

  res.status(201).json({ message: msg });
});

/** PATCH /api/support/admin/conversations/:id/status */
export const adminUpdateStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ['open', 'waiting_customer', 'resolved'];
  if (!allowed.includes(status)) return res.status(422).json({ message: 'Invalid status' });

  const convo = await SupportConversation.findByIdAndUpdate(
    req.params.id, { $set: { status } }, { new: true }
  );
  if (!convo) return res.status(404).json({ message: 'Conversation not found' });

  if (status === 'resolved') {
    await ActivityLog.create({ actor: req.user._id, action: 'support_conversation_resolved',
      details: { conversationId: convo._id } });
  }
  res.json({ conversation: convo });
});
