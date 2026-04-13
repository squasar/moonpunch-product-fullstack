import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/roles';
import {
  getDashboardStats,
  getUsers,
  updateUserRole,
  disableUser,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  publishProduct,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getComments,
  approveComment,
  rejectComment,
  deleteComment,
  getLicenses,
  revokeLicense,
  getSubscribers,
  getAnalytics,
} from '../controllers/admin.controller';

const router = Router();

// Protect all admin routes
router.use(authenticate, requireRole('admin'));

// ─── Dashboard ────────────────────────────────────────────────────────────
router.get('/dashboard/stats', getDashboardStats);
router.get('/analytics', getAnalytics);

// ─── Users Management ─────────────────────────────────────────────────────
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.put('/users/:id/disable', disableUser);

// ─── Products Management ──────────────────────────────────────────────────
router.get('/products', getProducts);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
router.post('/products/:id/publish', publishProduct);

// ─── Categories Management ────────────────────────────────────────────────
router.get('/categories', getCategories);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ─── Comments Moderation ──────────────────────────────────────────────────
router.get('/comments', getComments);
router.post('/comments/:id/approve', approveComment);
router.post('/comments/:id/reject', rejectComment);
router.delete('/comments/:id', deleteComment);

// ─── Licenses Management ──────────────────────────────────────────────────
router.get('/licenses', getLicenses);
router.put('/licenses/:id/revoke', revokeLicense);

// ─── Subscribers Management ───────────────────────────────────────────────
router.get('/subscribers', getSubscribers);

export default router;
