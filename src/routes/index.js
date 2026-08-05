import { Router } from 'express';
import homeRoutes from './home.routes.js';
import aboutRoutes from './about.routes.js';
import sessionsRoutes from './sessions.routes.js';

const router = Router();

router.use(homeRoutes);
router.use(aboutRoutes);
router.use(sessionsRoutes);

export default router;
