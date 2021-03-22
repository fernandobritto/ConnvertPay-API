import { Router } from 'express'
import { celebrate, Joi, Segments } from 'celebrate'
import UsersController from '../controllers/UsersController'
// import isAuthenticated from '@server/middlewares/isAuthenticated'

const usersRouter = Router()
const usersController = new UsersController()

usersRouter.get('/', usersController.index)

usersRouter.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  usersController.create,
)

usersRouter.delete(
  '/:id',
  celebrate({
    [Segments.PARAMS]: {
      id: Joi.string().uuid().required(),
    },
  }),
  usersController.delete,
)

export default usersRouter
