import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole }  from '../middleware/roles';
import { listComments, createComment, approveComment, deleteComment } from '../controllers/comments.controller';

const router = Router();

router.get('/product/:productId',          listComments);
router.post('/product/:productId',         authenticate, createComment);
router.patch('/:id/approve',               authenticate, requireRole('admin', 'moderator'), approveComment);
router.delete('/:id',                      authenticate, deleteComment);

export default router;
