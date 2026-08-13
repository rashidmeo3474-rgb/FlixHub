import Product from '../models/Product.js';
import Account from '../models/Account.js';
import { asyncHandler } from '../middleware/error.js';

/* ─────────────────────────────────────────────
   Full resolution-tiered catalog
   ───────────────────────────────────────────── */
const FALLBACK_PRODUCTS = [
  /* ── 480p SD ── */
  { name: 'Netflix',       quality: '480p SD',  monthlyPrice: 300,  compareAt: 400,  accent: '#e50914', category: 'movies', slug: 'netflix-480p',       warrantyMonths: 1 },
  { name: 'Prime Video',   quality: '480p SD',  monthlyPrice: 250,  compareAt: 350,  accent: '#00a8e1', category: 'movies', slug: 'prime-480p',          warrantyMonths: 1 },
  { name: 'Disney+',       quality: '480p SD',  monthlyPrice: 280,  compareAt: 380,  accent: '#4b6cf7', category: 'movies', slug: 'disney-480p',         warrantyMonths: 1 },
  { name: 'HBO Max',       quality: '480p SD',  monthlyPrice: 300,  compareAt: 400,  accent: '#9b30ff', category: 'movies', slug: 'hbo-480p',            warrantyMonths: 1 },

  /* ── 720p HD ── */
  { name: 'Netflix',       quality: '720p HD',  monthlyPrice: 380,  compareAt: 500,  accent: '#e50914', category: 'movies', slug: 'netflix-720p',        warrantyMonths: 1 },
  { name: 'Prime Video',   quality: '720p HD',  monthlyPrice: 300,  compareAt: 420,  accent: '#00a8e1', category: 'movies', slug: 'prime-720p',          warrantyMonths: 1 },
  { name: 'Disney+',       quality: '720p HD',  monthlyPrice: 340,  compareAt: 460,  accent: '#4b6cf7', category: 'movies', slug: 'disney-720p',         warrantyMonths: 1 },
  { name: 'HBO Max',       quality: '720p HD',  monthlyPrice: 380,  compareAt: 500,  accent: '#9b30ff', category: 'movies', slug: 'hbo-720p',            warrantyMonths: 1 },

  /* ── 1080p HD ── */
  { name: 'Netflix',       quality: '1080p HD', monthlyPrice: 450,  compareAt: 600,  accent: '#e50914', category: 'movies', slug: 'netflix',             warrantyMonths: 1 },
  { name: 'Prime Video',   quality: '1080p HD', monthlyPrice: 350,  compareAt: 500,  accent: '#00a8e1', category: 'movies', slug: 'prime-video',         warrantyMonths: 1 },
  { name: 'Disney+',       quality: '1080p HD', monthlyPrice: 400,  compareAt: 550,  accent: '#4b6cf7', category: 'movies', slug: 'disney',              warrantyMonths: 1 },
  { name: 'HBO Max',       quality: '1080p HD', monthlyPrice: 450,  compareAt: 600,  accent: '#9b30ff', category: 'movies', slug: 'hbo-max',             warrantyMonths: 1 },
  { name: 'Apple TV+',     quality: '1080p HD', monthlyPrice: 1800, compareAt: 2500, accent: '#d8d8d8', category: 'movies', slug: 'apple-tv-1080p',      warrantyMonths: 1 },

  /* ── 4K UHD ── */
  { name: 'Netflix',       quality: '4K UHD',   monthlyPrice: 550,  compareAt: 750,  accent: '#e50914', category: 'movies', slug: 'netflix-4k',          warrantyMonths: 1 },
  { name: 'Prime Video',   quality: '4K UHD',   monthlyPrice: 450,  compareAt: 650,  accent: '#00a8e1', category: 'movies', slug: 'prime-4k',            warrantyMonths: 1 },
  { name: 'Disney+',       quality: '4K UHD',   monthlyPrice: 500,  compareAt: 700,  accent: '#4b6cf7', category: 'movies', slug: 'disney-4k',           warrantyMonths: 1 },
  { name: 'HBO Max',       quality: '4K UHD',   monthlyPrice: 550,  compareAt: 750,  accent: '#9b30ff', category: 'movies', slug: 'hbo-4k',              warrantyMonths: 1 },
  { name: 'Apple TV+',     quality: '4K UHD',   monthlyPrice: 2200, compareAt: 3000, accent: '#d8d8d8', category: 'movies', slug: 'apple-tv',            warrantyMonths: 1 },

  /* ── 8K UHD ── */
  { name: 'Apple TV+',     quality: '8K UHD',   monthlyPrice: 2700, compareAt: 4000, accent: '#d8d8d8', category: 'movies', slug: 'apple-tv-8k',         warrantyMonths: 1 },
  { name: 'Netflix',       quality: '8K UHD',   monthlyPrice: 650,  compareAt: 900,  accent: '#e50914', category: 'movies', slug: 'netflix-8k',          warrantyMonths: 1 },
  { name: 'HBO Max',       quality: '8K UHD',   monthlyPrice: 650,  compareAt: 900,  accent: '#9b30ff', category: 'movies', slug: 'hbo-8k',              warrantyMonths: 1 },

  /* ── Bundles ── */
  { name: 'Netflix + Prime Video', quality: '4K UHD', monthlyPrice: 600, compareAt: 1000, accent: '#e50914', category: 'bundle', slug: 'netflix-prime', warrantyMonths: 1 },
];

/* linear pricing: total = monthly × months */
const calcPrices = (monthly) =>
  Object.fromEntries([1, 2, 3, 4, 5, 6].map((m) => [m, monthly * m]));

const withStock = async (products) => {
  try {
    // Check if database connection is available
    const mongoose = await import('mongoose');
    if (mongoose.default.connection.readyState !== 1) {
      console.warn('Database not connected - showing 0 stock');
      return products.map((p) => ({
        ...p.toObject(),
        inStock: 0, // Show 0 when database is not connected
        prices: calcPrices(p.monthlyPrice),
      }));
    }

    const counts = await Account.aggregate([
      { 
        $match: { 
          $and: [
            { accountStatus: { $in: ['active', 'expiring_soon'] } },
            {
              $or: [
                { status: 'available' },
                { 'slots.status': 'available' }
              ]
            }
          ]
        }
      },
      { 
        $group: { 
          _id: '$product', 
          availableAccounts: { $sum: 1 },
          availableSlots: { 
            $sum: { 
              $size: { 
                $filter: {
                  input: '$slots',
                  cond: { $eq: ['$$this.status', 'available'] }
                }
              }
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          // Count either available accounts OR available slots (whichever is higher)
          count: { $max: ['$availableAccounts', '$availableSlots'] }
        }
      }
    ]);

    const map = new Map(counts.map((c) => [String(c._id), c.count]));
    
    return products.map((p) => ({
      ...p.toObject(),
      inStock: map.get(String(p._id)) || 0, // Show real count, 0 if none
      prices: calcPrices(p.monthlyPrice),
    }));
    
  } catch (error) {
    console.warn('Stock calculation error:', error.message);
    // Return 0 stock when there's an error instead of fake numbers
    return products.map((p) => ({
      ...p.toObject(),
      inStock: 0, // Show 0 when there's an error
      prices: calcPrices(p.monthlyPrice),
    }));
  }
};

const buildFallback = () =>
  FALLBACK_PRODUCTS.map((p) => ({
    _id: p.slug,
    ...p,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    inStock: 0, // Show 0 for fallback products when no real accounts
    prices: calcPrices(p.monthlyPrice),
  }));

export const listProducts = asyncHandler(async (req, res) => {
  const filter = { active: true };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.quality)  filter.quality  = new RegExp(req.query.quality, 'i');

  try {
    const dbProducts = await Product.find(filter).sort({ createdAt: 1 });
    const fallbackAll = buildFallback();

    // If filters are active (category/quality), only use DB + exact fallback match
    const hasFilter = req.query.category || req.query.quality;

    if (hasFilter) {
      // With filters: use DB results; if empty fall back to filtered fallbacks
      if (dbProducts.length) return res.json({ products: await withStock(dbProducts) });
      return res.json({ products: fallbackAll.filter(p => {
        if (req.query.category && p.category !== req.query.category) return false;
        if (req.query.quality  && !new RegExp(req.query.quality, 'i').test(p.quality)) return false;
        return true;
      })});
    }

    // No filters: merge DB products with fallback so all slugs are always present
    const dbSlugs = new Set(dbProducts.map(p => p.slug));
    const dbWithStock = dbProducts.length ? await withStock(dbProducts) : [];

    // Fallback entries for slugs missing from DB
    const missingFallbacks = fallbackAll.filter(p => !dbSlugs.has(p.slug));

    // Combine: real DB products first, then missing fallbacks
    const merged = [...dbWithStock, ...missingFallbacks];
    return res.json({ products: merged });

  } catch (err) {
    console.warn('Product DB lookup failed, using fallback:', err.message);
  }

  return res.json({ products: buildFallback() });
});

export const getProduct = asyncHandler(async (req, res) => {
  const slug = req.params.slug;
  try {
    const product = await Product.findOne({ slug, active: true });
    if (product) {
      const [item] = await withStock([product]);
      return res.json({ product: item });
    }
  } catch (err) {
    console.warn('Product detail lookup failed, using fallback:', err.message);
  }

  const fallback = buildFallback().find((p) => p.slug === slug);
  if (!fallback) return res.status(404).json({ message: 'Product not found' });
  return res.json({ product: fallback });
});
