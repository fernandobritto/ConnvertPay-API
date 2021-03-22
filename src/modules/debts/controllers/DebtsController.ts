import { Request, Response } from 'express'
import RegisterDebtService from '../services/RegisterDebtService'
import ListAllDebtService from '../services/ListAllDebtService'
import ShowDebtService from '../services/ShowDebtService'
import UpdateDebtService from '../services/UpdateDebtService'
import DeleteDebtService from '../services/DeleteDebtService'

export default class DebtsController {
  public async index(request: Request, response: Response): Promise<Response> {
    const listDebts = new ListAllDebtService()
    const debts = await listDebts.execute()

    return response.status(200).json(debts)
  }

  public async show(request: Request, response: Response): Promise<Response> {
    const { id } = request.params
    const showDebt = new ShowDebtService()
    const debt = await showDebt.execute({ id })

    return response.status(200).json(debt)
  }

  public async create(request: Request, response: Response): Promise<Response> {
    const { name, description, date, amount } = request.body
    const createDebt = new RegisterDebtService()

    const debt = await createDebt.execute({
      name,
      description,
      date,
      amount,
    })

    return response.status(201).json({
      msg: 'Divida cadastrada com sucesso',
      debt,
    })
  }

  public async update(request: Request, response: Response): Promise<Response> {
    const { name, description, date, amount } = request.body
    const { id } = request.params

    const updateDebt = new UpdateDebtService()

    const debt = await updateDebt.execute({
      id,
      name,
      description,
      date,
      amount,
    })

    return response.json(debt)
  }

  public async delete(request: Request, response: Response): Promise<Response> {
    const { id } = request.params

    const deleteDebt = new DeleteDebtService()

    await deleteDebt.execute({ id })

    return response
      .status(200)
      .json({ msg: 'A dívida foi paga e excluída dos registros com sucesso' })
  }
}
