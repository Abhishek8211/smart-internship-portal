import { Router, Response } from 'express';
import { dbStore } from '../models/dbStore';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// 1. GET ALL USER NOTIFICATIONS
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const list = await dbStore.notifications.findByUserId(req.user!.userId);
    res.json(list);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 2. MARK AS READ
router.put('/:id/read', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  try {
    const notif = await dbStore.notifications.markAsRead(req.params.id);
    if (!notif) return res.status(404).json({ error: 'Notification not found.' });
    res.json({ message: 'Notification marked as read successfully.', notification: notif });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
export default router;
