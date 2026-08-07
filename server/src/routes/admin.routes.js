import { Router } from 'express';
import { adminOnly } from '../middleware/auth.js';
import {
  stats, stockOverview, addAccounts, deleteAccount,
  allOrders, getOrderDetail, updateOrderStatus,
  upsertProduct, deleteProduct,
  allUsers, getUserDetail, updateUserRole, deleteUser,
  activityLog
} from '../controllers/adminController.js';

const router = Router();
router.use(adminOnly);

/* stats */
router.get('/stats', stats);

/* stock */
router.get('/stock', stockOverview);
router.post('/stock', addAccounts);
router.delete('/stock/:id', deleteAccount);

/* orders */
router.get('/orders', allOrders);
router.get('/orders/:id', getOrderDetail);
router.patch('/orders/:id', updateOrderStatus);

/* products */
router.post('/products', upsertProduct);
router.delete('/products/:id', deleteProduct);

/* users */
router.get('/users', allUsers);
router.get('/users/:id', getUserDetail);
router.patch('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

/* activity log */
router.get('/activity', activityLog);

export default router;
