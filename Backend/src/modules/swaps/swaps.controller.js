import {
  proposeSwapService,
  getEligibleExecutionsService,
  acceptSwapService,
  rejectSwapService
} from './swaps.service.js';

export async function proposeSwapController(req, res, next) {
  try {
    const houseId = req.houseId;
    const { execSolId, execDestId } = req.body;
    const result = await proposeSwapService(houseId, req.user.userId, Number(execSolId), Number(execDestId));
    return res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function getEligibleExecutionsController(req, res, next) {
  try {
    const houseId = req.houseId;
    const execId = Number(req.params.execId);
    const executions = await getEligibleExecutionsService(houseId, execId, req.user.userId);
    return res.json({ executions });
  } catch (err) { next(err); }
}

export async function acceptSwapController(req, res, next) {
  try {
    const swapId = Number(req.params.swapId);
    await acceptSwapService(swapId, req.user.userId);
    return res.json({ ok: true });
  } catch (err) { next(err); }
}

export async function rejectSwapController(req, res, next) {
  try {
    const swapId = Number(req.params.swapId);
    await rejectSwapService(swapId, req.user.userId);
    return res.json({ ok: true });
  } catch (err) { next(err); }
}
