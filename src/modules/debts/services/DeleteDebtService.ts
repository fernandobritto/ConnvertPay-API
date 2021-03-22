import AppError from '@server/errors/AppError'
import { getCustomRepository } from 'typeorm'
import { DebtsRepository } from '../repositories/DebtsRepository'

interface IRequest {
  id: string
}

class DeleteDebtService {
  public async execute({ id }: IRequest): Promise<void> {
    const debtsRepository = getCustomRepository(DebtsRepository)

    const debt = await debtsRepository.findOne(id)

    if (!debt) {
      throw new AppError('Registro de dívida não encontrado')
    }

    await debtsRepository.remove(debt)
  }
}

export default DeleteDebtService
