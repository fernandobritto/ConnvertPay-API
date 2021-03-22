import AppError from '@server/errors/AppError'
import { getCustomRepository } from 'typeorm'
import Debt from '../entities/Debt'
import { DebtsRepository } from '../repositories/DebtsRepository'

interface IRequest {
  id: string
  name: string
  description: string
  date: string
  amount: number
}

class UpdateDebtService {
  public async execute({ id, name, description, date, amount }: IRequest): Promise<Debt> {
    const debtsRepository = getCustomRepository(DebtsRepository)
    const debt = await debtsRepository.findOne(id)

    if (!debt) {
      throw new AppError('O cadastro desta dívida não foi encontrado ')
    }

    debt.name = name
    debt.description = description
    debt.date = date
    debt.amount = amount

    await debtsRepository.save(debt)

    return debt
  }
}

export default UpdateDebtService
