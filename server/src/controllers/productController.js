import Product from '../models/Product.js';
import Account from '../models/Account.js';
import { asyncHandler } from '../middleware/error.js';

const FALLBACK_PRODUCTS = [
  { name: 'Netflix',         quality: '1080p HD', monthlyPrice: 350,  compareAt: 450,  accent: '#e50914', category: 'movies', slug: 'netflix',       warrantyMonths: 1 },
  { name: 'Prime Video',     quality: '4K UHD',   monthlyPrice: 250,  compareAt: 300,  accent: '#00a8e1', category: 'movies', slug: 'prime-video',    warrantyMonths: 1 },
  { name: 'Disney+',         quality: '4K UHD',   monthlyPrice: 300,  compareAt: 450,  accent: '#4b6cf7', category: 'movies', slug: 'disney',         warrantyMonths: 1 },
  { name: 'Apple TV+',       quality: '8K UHD',   monthlyPrice: 2600, compareAt: 5500, accent: '#d8d8d8', category: 'movies', slug: 'apple-tv',       warrantyMonths: 1 },
  { name: 'Netflix + Prime', quality: '4K UHD',   monthlyPrice: 500,  compareAt: 1900, accent: '#e50914', category: 'bundle', slug: 'netflix-prime',  warrantyMonths: 1 },
  { name: 'HBO Max',         quality: '4K UHD',   monthlyPrice: 350,  compareAt: 1200, accent: '#7b2ff7', category: 'movies', slug: 'hbo-max',        warrantyMonths: 1 },
];

const withStock = async (products) => {
  const counts = await Account.aggregate([
    { $match: { status: 'available' } },
    { $group: { _id: '$product', count: { $sum: 1 } } }
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  return products.map((p) => ({
    ...p.toObject(),
    inStock: map.get(String(p._id)) || 8,
    prices: Object.fromEntries([1, 3, 6, 12].map((m) => [
      m,
      p.priceFor ? p.priceFor(m) : Math.round(p.monthlyPrice * (m === 3 ? 2.7 : m === 6 ? 5 : m === 12 ? 9 : 1))
    ]))
  }));
};

const buildFallbackProducts = () => FALLBACK_PRODUCTS.map((product) => ({
  _id: product.slug,
  ...product,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  inStock: 8,
  prices: Object.fromEntries([1, 3, 6, 12].map((m) => [
    m,
    Math.round(product.monthlyPrice * (m === 3 ? 2.7 : m === 6 ? 5 : m === 12 ? 9 : 1))
  ]))
}));

export const listProducts = asyncHandler(async (req, res) => {
  const filter = { active: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.quality) filter.quality = new RegExp(req.query.quality, 'i');

  try {
    const products = await Product.find(filter).sort({ createdAt: 1 });
    if (products.length) {
      return res.json({ products: await withStock(products) });
    }
  } catch (error) {
    console.warn('Product DB lookup failed, using fallback catalog:', error.message);
  }

  return res.json({ products: buildFallbackProducts() });
});

export const getProduct = asyncHandler(async (req, res) => {
  const requestedSlug = req.params.slug;
  try {
    const product = await Product.findOne({ slug: requestedSlug, active: true });
    if (product) {
      const [item] = await withStock([product]);
      return res.json({ product: item });
    }
  } catch (error) {
    console.warn('Product detail lookup failed, using fallback catalog:', error.message);
  }

  const fallback = buildFallbackProducts().find((p) => p.slug === requestedSlug);
  if (!fallback) return res.status(404).json({ message: 'Product not found' });
  return res.json({ product: fallback });
});
