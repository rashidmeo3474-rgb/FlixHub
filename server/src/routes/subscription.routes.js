import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  adminListSubscriptions, pendingAssignments, inventorySummary,
  assignSubscription, adminGetSubscription, renewSubscription,
  cancelSubscription, adminListAccounts, adminUpdateAccount,
  availableSlots, mySubscriptions, mySubscriptionDetail,
} from '../controllers/subscriptionController.js';

const router = Router();

/* ── Admin ── */
router.get('/admin',                  adminOnly, adminListSubscriptions);
router.get('/admin/pending',          adminOnly, pendingAssignments);
router.get('/admin/inventory',        adminOnly, inventorySummary);
router.get('/admin/available-slots',  adminOnly, availableSlots);
router.get('/admin/accounts',         adminOnly, adminListAccounts);
router.patch('/admin/accounts/:id',   adminOnly, adminUpdateAccount);
router.post('/admin/assign',          adminOnly, assignSubscription);
router.get('/admin/:id',              adminOnly, adminGetSubscription);
router.patch('/admin/:id/renew',      adminOnly, renewSubscription);
router.patch('/admin/:id/cancel',     adminOnly, cancelSubscription);

/* ── Customer ── */
router.get('/mine',     protect, mySubscriptions);
router.get('/mine/:id', protect, mySubscriptionDetail);

export default router;
