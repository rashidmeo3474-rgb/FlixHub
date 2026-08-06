import { Router } from 'express';
import { createOrder, payOrder, myOrders, getOrder } from '../controllers/orderController.js';
import { protect } from '../middleware/auth.js';

const optionalAuth = (req, res, next) =>
  req.headers.authorization ? protect(req, res, next) : next();

const router = Router();
router.post('/', optionalAuth, createOrder);
router.post('/:id/pay', optionalAuth, payOrder);
router.get('/mine', protect, myOrders);
router.get('/:reference', optionalAuth, getOrder);
export default router;
