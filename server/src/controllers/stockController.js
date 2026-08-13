import Account from '../models/Account.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/error.js';

/**
 * Get real-time stock overview for admin dashboard
 */
export const getStockOverview = asyncHandler(async (req, res) => {
  try {
    // Get all products
    const products = await Product.find({ active: true }).sort({ name: 1 });
    
    // Calculate real stock for each product
    const stockData = [];
    
    for (const product of products) {
      // Count available accounts
      const availableAccounts = await Account.countDocuments({
        product: product._id,
        accountStatus: { $in: ['active', 'expiring_soon'] },
        status: 'available'
      });
      
      // Count available slots
      const accountsWithSlots = await Account.find({
        product: product._id,
        accountStatus: { $in: ['active', 'expiring_soon'] },
        'slots.status': 'available'
      });
      
      const availableSlots = accountsWithSlots.reduce((total, account) => {
        return total + account.slots.filter(slot => slot.status === 'available').length;
      }, 0);
      
      // Total available = accounts + slots
      const totalAvailable = availableAccounts + availableSlots;
      
      stockData.push({
        productId: product._id,
        productName: product.name,
        quality: product.quality,
        slug: product.slug,
        availableAccounts,
        availableSlots,
        totalAvailable,
        status: totalAvailable === 0 ? 'out_of_stock' : 
                totalAvailable <= 5 ? 'low_stock' : 'in_stock'
      });
    }
    
    // Summary statistics
    const summary = {
      totalProducts: stockData.length,
      inStock: stockData.filter(p => p.status === 'in_stock').length,
      lowStock: stockData.filter(p => p.status === 'low_stock').length,
      outOfStock: stockData.filter(p => p.status === 'out_of_stock').length,
      totalAccounts: stockData.reduce((sum, p) => sum + p.availableAccounts, 0),
      totalSlots: stockData.reduce((sum, p) => sum + p.availableSlots, 0)
    };
    
    res.json({
      success: true,
      summary,
      products: stockData
    });
    
  } catch (error) {
    console.error('Stock overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stock overview',
      error: error.message
    });
  }
});

/**
 * Add stock notification when products go out of stock
 */
export const checkLowStockAlerts = asyncHandler(async (req, res) => {
  try {
    const lowStockProducts = await Account.aggregate([
      {
        $match: {
          accountStatus: { $in: ['active', 'expiring_soon'] },
          $or: [
            { status: 'available' },
            { 'slots.status': 'available' }
          ]
        }
      },
      {
        $group: {
          _id: '$product',
          count: { $sum: 1 },
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
        $match: {
          $expr: {
            $lte: [{ $add: ['$count', '$availableSlots'] }, 5]
          }
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }
      }
    ]);
    
    res.json({
      success: true,
      lowStockAlerts: lowStockProducts.map(item => ({
        productName: item.product[0]?.name || 'Unknown Product',
        quality: item.product[0]?.quality || '',
        availableCount: item.count + item.availableSlots,
        urgency: item.count + item.availableSlots === 0 ? 'critical' : 'warning'
      }))
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check stock alerts',
      error: error.message
    });
  }
});