import mongoose from 'mongoose';

/** Pre-uploaded credential pool used for automatic delivery. */
const accountSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  login: { type: String, required: true },
  password: { type: String, required: true },
  profile: { type: String, default: '' },
  status: { type: String, enum: ['available', 'assigned', 'replaced'], default: 'available', index: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', default: null },
  assignedAt: { type: Date, default: null },
  note: { type: String, default: '' }
}, { timestamps: true });

accountSchema.index({ product: 1, status: 1 });

export default mongoose.model('Account', accountSchema);
