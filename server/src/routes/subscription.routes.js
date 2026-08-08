import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  adminListSubscriptions, pendingAssignments, inventorySummary,
  assignSubscription, adminGetSubscription, renewSubscription,
  cancelSubscription, adminListAccounts, adminUpdateAccount,
  availableSlots, mySubscriptions, mySubscriptionDetail,
  /* ── Subscription Inventory ── */
  inventoryAddAccount,
  inventoryDeleteAccount,
  inventoryFullSummary,
  inventoryListAccounts,
  inventoryGetAccount,
  inventoryAvailableSlots,
  inventoryAssignSlot,
} from '../controllers/subscriptionController.js';

const router = Router();

/* ────────────────────────────────────────────────
   SUBSCRIPTION INVENTORY  (centralized section)
   All routes are admin-only.
   Mount BEFORE /admin/:id wildcard to avoid collisions.
──────────────────────────────────────────────── */
router.get   ('/admin/inventory/summary',          adminOnly, inventoryFullSummary);
router.get   ('/admin/inventory/accounts',         adminOnly, inventoryListAccounts);
router.post  ('/admin/inventory/accounts',         adminOnly, inventoryAddAccount);
router.get   ('/admin/inventory/accounts/:id',     adminOnly, inventoryGetAccount);
router.patch ('/admin/inventory/accounts/:id',     adminOnly, adminUpdateAccount);
router.delete('/admin/inventory/accounts/:id',     adminOnly, inventoryDeleteAccount);
router.get   ('/admin/inventory/available',        adminOnly, inventoryAvailableSlots);
router.post  ('/admin/inventory/assign-slot',      adminOnly, inventoryAssignSlot);

/* ────────────────────────────────────────────────
   EXISTING admin subscription routes
──────────────────────────────────────────────── */
router.get ('/admin',                  adminOnly, adminListSubscriptions);
router.get ('/admin/pending',          adminOnly, pendingAssignments);
router.get ('/admin/inventory',        adminOnly, inventorySummary);          // legacy summary (AccountScreenManager)
router.get ('/admin/available-slots',  adminOnly, availableSlots);            // legacy (SubscriptionsManager assign modal)
router.get ('/admin/accounts',         adminOnly, adminListAccounts);         // legacy (AccountScreenManager)
router.patch('/admin/accounts/:id',    adminOnly, adminUpdateAccount);        // now handles all account fields
router.post ('/admin/assign',          adminOnly, assignSubscription);
router.get ('/admin/:id',              adminOnly, adminGetSubscription);
router.patch('/admin/:id/renew',       adminOnly, renewSubscription);
router.patch('/admin/:id/cancel',      adminOnly, cancelSubscription);

/* ────────────────────────────────────────────────
   Customer routes
──────────────────────────────────────────────── */
router.get('/mine',     protect, mySubscriptions);
router.get('/mine/:id', protect, mySubscriptionDetail);

export default router;
