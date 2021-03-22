import { Router } from 'express'
import usersRouter from '@modules/users/routes/users.routes'
import sessionsRouter from '@modules/users/routes/sessions.routes'
import debtsRouter from '@modules/debts/routes/debts.routes'

const routes = Router()

routes.use('/v1/users', usersRouter)
routes.use('/v1/sessions', sessionsRouter)
routes.use('/v1/debts', debtsRouter)

export default routes
