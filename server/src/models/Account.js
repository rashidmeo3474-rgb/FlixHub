import mongoose from 'mongoose';

/** Pre-uploaded credential pool used for automatic delivery. */
const slotSchema = new mongoose.Schema({
  index:       { type: Number, required: true },   // 1-based
  label:       { type: String, default: '' },       // e.g. "Profile 3"
  pin:         { type: String, default: '' },
  status:      { type: String, enum: ['available', 'assigned'], default: 'available' },
  assignedTo:  { type: mongoose.Schema.Types.ObjectId, ref: 'User',         default: null },
  subscription:{ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
  assignedAt:  { type: Date, default: null },
}, { _id: false });

const accountSchema = new mongoose.Schema({
  product:    { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  login:      { type: String, required: true },
  password:   { type: String, required: true },
  profile:    { type: String, default: '' },
  status:     { type: String, enum: ['available', 'assigned', 'replaced'], default: 'available', index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  assignedAt: { type: Date, default: null },
  note:       { type: String, default: '' },

  /* ── NEW: slot/screen management ── */
  totalSlots: { type: Number, default: 1 },     // configurable by admin
  slots:      { type: [slotSchema], default: [] }, // populated when totalSlots is set
}, { timestamps: true });

accountSchema.index({ product: 1, status: 1 });

/* Auto-init slots when totalSlots changes */
accountSchema.pre('save', function (next) {
  if (this.isModified('totalSlots') || (this.isNew && this.totalSlots > 0)) {
    const current = this.slots.length;
    const target  = this.totalSlots;
    if (current < target) {
      for (let i = current + 1; i <= target; i++) {
        this.slots.push({ index: i, label: `Profile ${i}`, status: 'available' });
      }
    } else if (current > target) {
      this.slots = this.slots.slice(0, target);
    }
  }
  next();
});

export default mongoose.model('Account', accountSchema);
