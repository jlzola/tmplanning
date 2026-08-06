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
  release
} from '../controllers/sessions.controller.js';

const router = Router();

router.get('/sessions/new', showNewSessionForm);
router.post('/sessions', create);
router.get('/sessions/:id', showSession);
router.get('/sessions/:id/edit', showEditSessionForm);
router.post('/sessions/:id/edit', update);
router.post('/sessions/:id/close', close);
router.post('/sessions/:id/reopen', reopen);
router.post('/sessions/:id/delete', remove);
router.get('/sessions/:id/export.json', exportJson);
router.get('/sessions/:id/operators.csv', exportOperatorsCsv);
router.get('/api/sessions/:id/bands', apiGrid);
router.get('/sessions/:id/bands.svg', bandChartSvg);
router.post('/sessions/:id/reserve', reserve);
router.post('/sessions/:id/release', release);

export default router;
