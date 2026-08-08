import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  /* relationships */
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User',    required: true, index: true },
  order:   { type: mongoose.Schema.Types.ObjectId, ref: 'Order',   required: true, index: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  account: { type: mongoose.Schema.Types.ObjectId, ref: 'Account', default: null },

  /* slot */
  slotIndex:   { type: Number, default: null },   // 1-based slot number within the account
  slotLabel:   { type: String, default: '' },     // e.g. "Profile 3"
  profilePin:  { type: String, default: '' },

  /* dates */
  startDate:  { type: Date, default: null },
  expiryDate: { type: Date, default: null },

  /* status */
  status: {
    type: String,
    enum: ['pending_assignment', 'active', 'expiring_soon', 'expiring_today', 'urgent', 'expired', 'cancelled'],
    default: 'pending_assignment',
    index: true
  },

  /* renewal history */
  renewals: [{
    renewedAt:  { type: Date, default: Date.now },
    renewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    oldExpiry:  Date,
    newExpiry:  Date,
    daysAdded:  Number,
    note:       { type: String, default: '' }
  }],

  /* admin notes */
  adminNotes: { type: String, default: '' },
  cancelledAt: { type: Date, default: null },
}, { timestamps: true });

/* ── Computed: remaining days ── */
subscriptionSchema.virtual('remainingDays').get(function () {
  if (!this.expiryDate) return null;
  const diff = this.expiryDate - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
});

/* ── Auto-compute status from expiryDate ── */
subscriptionSchema.methods.refreshStatus = function () {
  if (this.status === 'cancelled') return this.status;
  if (!this.expiryDate) return 'pending_assignment';
  const days = Math.ceil((this.expiryDate - Date.now()) / (1000 * 60 * 60 * 24));
  if (days < 0)      return 'expired';
  if (days === 0)    return 'expiring_today';
  if (days <= 3)     return 'urgent';
  if (days <= 7)     return 'expiring_soon';
  return 'active';
};

subscriptionSchema.set('toJSON', { virtuals: true });
subscriptionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Subscription', subscriptionSchema);
