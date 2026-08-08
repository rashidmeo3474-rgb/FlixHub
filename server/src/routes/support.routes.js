import { Router } from 'express';
import { protect, adminOnly } from '../middleware/auth.js';
import {
  createConversation, myConversations, getConversation, customerReply,
  adminListConversations, adminGetConversation, adminReply, adminUpdateStatus,
} from '../controllers/supportController.js';

const router = Router();

/* ── Admin ── */
router.get('/admin/conversations',           adminOnly, adminListConversations);
router.get('/admin/conversations/:id',       adminOnly, adminGetConversation);
router.post('/admin/conversations/:id/reply',adminOnly, adminReply);
router.patch('/admin/conversations/:id/status', adminOnly, adminUpdateStatus);

/* ── Customer ── */
router.post('/conversations',               protect, createConversation);
router.get('/conversations',                protect, myConversations);
router.get('/conversations/:id',            protect, getConversation);
router.post('/conversations/:id/messages',  protect, customerReply);

export default router;
