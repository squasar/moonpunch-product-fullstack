import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole }  from '../middleware/roles';
import { subscribe, unsubscribe, mySubscriptions, productSubscribers } from '../controllers/subscribers.controller';

const router = Router();

router.post('/product/:productId',   authenticate, subscribe);
router.delete('/product/:productId', authenticate, unsubscribe);
router.get('/me',                    authenticate, mySubscriptions);
router.get('/product/:productId',    authenticate, requireRole('admin'), productSubscribers);

export default router;
