import { declareVacationService, cancelVacationService, getMyVacationService } from './vacations.service.js';

export async function declareVacationController(req, res, next) {
  try {
    const { fechaInicio, fechaFin } = req.body;
    const result = await declareVacationService(req.user.userId, req.houseId, fechaInicio, fechaFin);
    return res.status(201).json(result);
  } catch (err) { next(err); }
}

export async function cancelVacationController(req, res, next) {
  try {
    const vacationId = Number(req.params.vacationId);
    const result = await cancelVacationService(vacationId, req.user.userId);
    return res.json(result);
  } catch (err) { next(err); }
}

export async function getMyVacationController(req, res, next) {
  try {
    const vacation = await getMyVacationService(req.user.userId, req.houseId);
    return res.json({ vacation: vacation || null });
  } catch (err) { next(err); }
}
