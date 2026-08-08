import { Router } from 'express';
import homeRoutes from './home.routes.js';
import aboutRoutes from './about.routes.js';
import sessionsRoutes from './sessions.routes.js';
import shareRoutes from './share.routes.js';

const router = Router();

router.use(homeRoutes);
router.use(aboutRoutes);
router.use(sessionsRoutes);
router.use(shareRoutes);

export default router;
