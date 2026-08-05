import { Router } from 'express';
import { adminOnly } from '../middleware/auth.js';
import {
  stats, stockOverview, addAccounts, allOrders, updateOrderStatus, upsertProduct, deleteProduct
} from '../controllers/adminController.js';

const router = Router();
router.use(adminOnly);              // every admin route is role-gated
router.get('/stats', stats);
router.get('/stock', stockOverview);
router.post('/stock', addAccounts);
router.get('/orders', allOrders);
router.patch('/orders/:id', updateOrderStatus);
router.post('/products', upsertProduct);
router.delete('/products/:id', deleteProduct);
export default router;
