import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole }  from '../middleware/roles';
import { getMe, updateMe, getPublicProfile, listUsers, changeRole, deleteUser } from '../controllers/users.controller';

const router = Router();

router.get('/me',       authenticate, getMe);
router.put('/me',       authenticate, updateMe);
router.get('/:id',      getPublicProfile);
router.get('/',         authenticate, requireRole('admin'), listUsers);
router.patch('/:id/role', authenticate, requireRole('admin'), changeRole);
router.delete('/:id',   authenticate, requireRole('admin'), deleteUser);

export default router;
