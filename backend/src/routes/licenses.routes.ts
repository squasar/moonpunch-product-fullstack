import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { requireRole }  from '../middleware/roles';
import { myLicenses, generateLicense, activateLicense, revokeLicense } from '../controllers/licenses.controller';

const router = Router();

router.get('/me',           authenticate, myLicenses);
router.post('/generate',    authenticate, requireRole('admin'), generateLicense);
router.post('/activate',    authenticate, activateLicense);
router.patch('/:id/revoke', authenticate, requireRole('admin'), revokeLicense);

export default router;
