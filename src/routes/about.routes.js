import { Router } from 'express';
import { showAbout } from '../controllers/about.controller.js';

const router = Router();

router.get('/about', showAbout);

export default router;
