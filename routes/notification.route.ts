import { Router, Request, Response } from 'express';
import { UserRole } from '../models/user.model';
import { protect } from '../middlewares/auth.middleware';
import { getAllNotifications } from '../controller/notification.controller';

const router = Router();

/**
 * GET /api/notifications
 * Admin-only route: fetch notifications with pagination + count by type
 * Query params: page, limit
 */
router.get('/notification/all', protect, async (req: Request, res: Response) => {
  try {
    // Only admin can access
    if ((req as Request & { user?: { role?: UserRole } }).user?.role !== UserRole.ADMIN) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admins only.',
      });
    }

    // Call controller logic
    await getAllNotifications(req, res);
  } catch (err: any) {
    console.error('Notification route error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Internal server error',
    });
  }
});

export default router;
