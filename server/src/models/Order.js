import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  quality: String,
  months: { type: Number, required: true },
  price: { type: Number, required: true },
  credentials: {
    login: String,
    password: String,
    profile: String,
    expiresAt: Date
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  reference: { type: String, unique: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  guestEmail: { type: String, default: '' },
  phone: { type: String, default: '' },
  items: [itemSchema],
  total: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
<<<<<<< HEAD
  paymentMethod: { type: String, enum: ['jazzcash', 'easypaisa', 'card'], required: true },
  paymentRef: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'paid', 'delivered', 'failed', 'refunded'], default: 'pending', index: true },
=======
  paymentMethod: { type: String, enum: ['jazzcash', 'easypaisa', 'nayapay', 'ubl', 'mcb', 'card'], required: true },
  paymentRef: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'paid', 'delivered', 'failed', 'refunded'], default: 'pending', index: true },
  paymentProofId: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentProof', default: null },
  adminNotes: { type: String, default: '' },
  rejectionReason: { type: String, default: '' },
>>>>>>> 178aa0fd1475a77692598040c72d5b4865dcf9f7
  deliveredAt: { type: Date, default: null }
}, { timestamps: true });

orderSchema.pre('validate', function setReference(next) {
  if (!this.reference) {
    this.reference = 'PV-' + Date.now().toString(36).toUpperCase().slice(-6);
  }
  next();
});

export default mongoose.model('Order', orderSchema);
