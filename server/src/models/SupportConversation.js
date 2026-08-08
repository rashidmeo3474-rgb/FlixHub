import mongoose from 'mongoose';

const supportConversationSchema = new mongoose.Schema({
  /* owner */
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  /* context — auto-populated so admin always knows what this is about */
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
  order:        { type: mongoose.Schema.Types.ObjectId, ref: 'Order',        default: null },
  product:      { type: mongoose.Schema.Types.ObjectId, ref: 'Product',      default: null },
  account:      { type: mongoose.Schema.Types.ObjectId, ref: 'Account',      default: null },
  slotIndex:    { type: Number, default: null },

  subject:  { type: String, default: '' },
  status:   { type: String, enum: ['open', 'waiting_customer', 'resolved'], default: 'open', index: true },
  unreadAdmin:    { type: Number, default: 0 },   // unread for admin
  unreadCustomer: { type: Number, default: 0 },   // unread for customer
  lastMessageAt:  { type: Date, default: Date.now, index: true },
}, { timestamps: true });

export default mongoose.model('SupportConversation', supportConversationSchema);
