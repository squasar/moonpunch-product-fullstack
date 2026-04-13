import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole }  from '../middleware/roles';
import { listProducts, getProduct, createProduct, updateProduct, archiveProduct, addMedia, removeMedia } from '../controllers/products.controller';

const router = Router();

router.get('/',              listProducts);
router.get('/:slug',         getProduct);
router.post('/',             authenticate, requireRole('admin'), createProduct);
router.put('/:id',           authenticate, requireRole('admin'), updateProduct);
router.delete('/:id',        authenticate, requireRole('admin'), archiveProduct);
router.post('/:id/media',    authenticate, requireRole('admin'), addMedia);
router.delete('/:id/media/:mediaId', authenticate, requireRole('admin'), removeMedia);

export default router;
