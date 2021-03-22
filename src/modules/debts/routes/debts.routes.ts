import { Router } from 'express'
import DebtsController from '../controllers/DebtsController'
import { celebrate, Joi, Segments } from 'celebrate'
import isAuthenticated from '@server/middlewares/isAuthenticated'

const debtsRouter = Router()
const debtsController = new DebtsController()

debtsRouter.get('/', debtsController.index)

debtsRouter.get(
  '/:id',
  isAuthenticated,
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  debtsController.show,
)

debtsRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      description: Joi.string().required(),
      date: Joi.string().required(),
      amount: Joi.number().required(),
    },
  }),
  debtsController.create,
)

debtsRouter.put(
  '/:id',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      description: Joi.string().required(),
      date: Joi.string().required(),
      amount: Joi.number().required(),
    },
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  debtsController.create,
)

debtsRouter.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  debtsController.delete,
)

export default debtsRouter
