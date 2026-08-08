import { Router } from 'express';
import { showShare } from '../controllers/share.controller.js';

const router = Router();

router.get('/share/:token', showShare);

export default router;
