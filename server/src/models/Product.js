import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  quality: { type: String, default: '4K UHD' },
  logo: { type: String, default: '' },
  accent: { type: String, default: '#54d6e8' },
  monthlyPrice: { type: Number, required: true },
  compareAt: { type: Number, default: 0 },
  category: { type: String, enum: ['movies', 'bundle'], default: 'movies' },
  warrantyMonths: { type: Number, default: 1 },
  active: { type: Boolean, default: true }
}, { timestamps: true });

// duration multipliers: 1, 3, 6, 12 months
productSchema.statics.MULTIPLIERS = { 1: 1, 3: 2.7, 6: 5, 12: 9 };

productSchema.methods.priceFor = function priceFor(months) {
  const mult = mongoose.model('Product').MULTIPLIERS[months] ?? months;
  return Math.round(this.monthlyPrice * mult);
};

export default mongoose.model('Product', productSchema);
