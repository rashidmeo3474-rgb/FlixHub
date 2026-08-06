import Product from '../models/Product.js';
import Account from '../models/Account.js';
import { asyncHandler } from '../middleware/error.js';

const withStock = async (products) => {
  const counts = await Account.aggregate([
    { $match: { status: 'available' } },
    { $group: { _id: '$product', count: { $sum: 1 } } }
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  return products.map((p) => ({
    ...p.toObject(),
    inStock: map.get(String(p._id)) || 0,
    prices: Object.fromEntries([1, 3, 6, 12].map((m) => [m, p.priceFor(m)]))
  }));
};

export const listProducts = asyncHandler(async (req, res) => {
  const filter = { active: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.quality) filter.quality = new RegExp(req.query.quality, 'i');
  const products = await Product.find(filter).sort({ createdAt: 1 });
  res.json({ products: await withStock(products) });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, active: true });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  const [item] = await withStock([product]);
  res.json({ product: item });
});
