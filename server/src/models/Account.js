import mongoose from 'mongoose';

/** Slot/profile allocation unit inside a purchased full account. */
const slotSchema = new mongoose.Schema({
  index:        { type: Number, required: true },   // 1-based
  label:        { type: String, default: '' },       // e.g. "Profile 3"
  pin:          { type: String, default: '' },
  status:       { type: String, enum: ['available', 'assigned'], default: 'available' },
  assignedTo:   { type: mongoose.Schema.Types.ObjectId, ref: 'User',         default: null },
  subscription: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
  assignedAt:   { type: Date, default: null },
}, { _id: false });

const accountSchema = new mongoose.Schema({
  /** Link to the Product (service) this account belongs to */
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },

  /** Full-account credentials (admin-purchased account) */
  login:      { type: String, required: true },
  password:   { type: String, required: true },
  profile:    { type: String, default: '' },

  /** Account-level inventory status (legacy single-account delivery) */
  status:     { type: String, enum: ['available', 'assigned', 'replaced'], default: 'available', index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  assignedAt: { type: Date, default: null },

  /** Admin note */
  note:       { type: String, default: '' },

  /* ── Subscription Inventory fields ── */
  /** e.g. "Premium", "Standard", "Basic" */
  plan:               { type: String, default: '' },
  /** Date admin purchased this full account */
  purchaseDate:       { type: Date, default: null },
  /** When the provider subscription expires */
  providerExpiryDate: { type: Date, default: null },
  /**
   * Provider-level account status derived from providerExpiryDate.
   * Values: active | expiring_soon | expired | disabled
   */
  accountStatus: {
    type: String,
    enum: ['active', 'expiring_soon', 'expired', 'disabled'],
    default: 'active',
    index: true,
  },

  /** Slot / screen management */
  totalSlots: { type: Number, default: 1 },
  slots:      { type: [slotSchema], default: [] },
}, { timestamps: true });

accountSchema.index({ product: 1, status: 1 });
accountSchema.index({ product: 1, accountStatus: 1 });

/* ── Helper: derive accountStatus from providerExpiryDate ── */
accountSchema.methods.refreshAccountStatus = function () {
  if (this.accountStatus === 'disabled') return 'disabled';
  if (!this.providerExpiryDate) return 'active';
  const daysLeft = Math.ceil((this.providerExpiryDate - Date.now()) / 86400000);
  if (daysLeft < 0)  return 'expired';
  if (daysLeft <= 7) return 'expiring_soon';
  return 'active';
};

/* ── Pre-save: sync slots[] array to totalSlots + guard capacity reduction ── */
accountSchema.pre('save', function (next) {
  // Refresh provider status
  const newStatus = this.refreshAccountStatus();
  if (this.accountStatus !== 'disabled') this.accountStatus = newStatus;

  // Sync slots to totalSlots
  if (this.isModified('totalSlots') || (this.isNew && this.totalSlots > 0)) {
    const current = this.slots.length;
    const target  = this.totalSlots;

    if (current < target) {
      // Add new slots
      for (let i = current + 1; i <= target; i++) {
        this.slots.push({ index: i, label: `Profile ${i}`, status: 'available' });
      }
    } else if (current > target) {
      // Guard: do not trim slots that are occupied
      const occupiedBeyondTarget = this.slots
        .slice(target)
        .some(s => s.status === 'assigned');

      if (occupiedBeyondTarget) {
        return next(new Error(
          `Cannot reduce capacity to ${target}: one or more slots beyond that limit are currently occupied. ` +
          `Unassign those customers first.`
        ));
      }
      this.slots = this.slots.slice(0, target);
    }
  }

  next();
});

export default mongoose.model('Account', accountSchema);
