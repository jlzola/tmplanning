import { Router } from 'express';
import {
  showNewSessionForm,
  create,
  showSession,
  showEditSessionForm,
  update,
  close,
  reopen,
  remove,
  exportJson,
  exportOperatorsCsv,
  apiGrid,
  bandChartSvg,
  reserve,
  release,
  requireUnlocked,
  requireUsageUnlocked,
  verifyPassword,
  verifyUsage,
  saveShare
} from '../controllers/sessions.controller.js';

const router = Router();

router.get('/sessions/new', showNewSessionForm);
router.post('/sessions', create);
router.get('/sessions/:id', showSession);
router.post('/sessions/:id/verify-password', verifyPassword);
router.post('/sessions/:id/verify-usage-password', verifyUsage);
router.get('/sessions/:id/edit', requireUnlocked, showEditSessionForm);
router.post('/sessions/:id/edit', requireUnlocked, update);
router.post('/sessions/:id/close', requireUnlocked, close);
router.post('/sessions/:id/reopen', requireUnlocked, reopen);
router.post('/sessions/:id/delete', requireUnlocked, remove);
router.get('/sessions/:id/export.json', exportJson);
router.get('/sessions/:id/operators.csv', exportOperatorsCsv);
router.get('/api/sessions/:id/bands', apiGrid);
router.get('/sessions/:id/bands.svg', bandChartSvg);
router.post('/sessions/:id/reserve', requireUsageUnlocked, reserve);
router.post('/sessions/:id/release', requireUsageUnlocked, release);
router.post('/sessions/:id/share', saveShare);

export default router;
