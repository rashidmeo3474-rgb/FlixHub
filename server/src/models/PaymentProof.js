import mongoose from 'mongoose';

const paymentProofSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  paymentMethod: { type: String, default: '' },
  transactionId: { type: String, default: '' },
  amountPaid: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  files: [{ type: String }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
  adminNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedAt: { type: Date, default: null },
  uploadedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('PaymentProof', paymentProofSchema);
