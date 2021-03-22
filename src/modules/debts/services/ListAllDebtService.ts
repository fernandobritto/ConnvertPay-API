import { getCustomRepository } from 'typeorm'
import Debt from '../entities/Debt'
import { DebtsRepository } from '../repositories/DebtsRepository'

class ListAllDebtService {
  public async execute(): Promise<Debt[]> {
    const debtsRepository = getCustomRepository(DebtsRepository)

    const debts = debtsRepository.find()

    return debts
  }
}

export default ListAllDebtService
