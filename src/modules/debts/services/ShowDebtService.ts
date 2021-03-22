import AppError from '@server/errors/AppError'
import { getCustomRepository } from 'typeorm'
import Debt from '../entities/Debt'
import { DebtsRepository } from '../repositories/DebtsRepository'

interface IRequest {
  id: string
}

class ShowDebtService {
  public async execute({ id }: IRequest): Promise<Debt> {
    const debtsRepository = getCustomRepository(DebtsRepository)

    const debt = await debtsRepository.findOne(id)

    if (!debt) {
      throw new AppError('Registro de dívida não encontrado')
    }

    return debt
  }
}

export default ShowDebtService
