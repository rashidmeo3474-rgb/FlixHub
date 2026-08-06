import { Router } from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { adminOnly } from '../middleware/auth.js';
import {
  listPaymentMethods,
  submitPaymentProof,
  myPaymentProofs,
  pendingProofs,
  reviewPaymentProof,
  getPaymentSettings,
  updatePaymentSettings,
  listNotifications,
  markNotificationsRead,
  deleteNotification
} from '../controllers/paymentController.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/methods', listPaymentMethods);
router.get('/settings', protect, getPaymentSettings);
router.put('/settings', adminOnly, updatePaymentSettings);
router.post('/:orderId/proof', protect, upload.array('files', 5), submitPaymentProof);
router.get('/mine', protect, myPaymentProofs);
router.get('/notifications', protect, listNotifications);
router.post('/notifications/read', protect, markNotificationsRead);
router.delete('/notifications/:id', protect, deleteNotification);
router.get('/admin/pending', adminOnly, pendingProofs);
router.post('/admin/:id/review', adminOnly, reviewPaymentProof);

export default router;
