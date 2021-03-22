import { getCustomRepository } from 'typeorm'
import Debt from '../entities/Debt'
import { DebtsRepository } from '../repositories/DebtsRepository'

interface IRequest {
  name: string
  description: string
  date: string
  amount: number
}

class RegisterDebtService {
  public async execute({ name, description, date, amount }: IRequest): Promise<Debt> {
    const debtsRepository = getCustomRepository(DebtsRepository)

    const debt = debtsRepository.create({
      name,
      description,
      date,
      amount,
    })

    await debtsRepository.save(debt)

    return debt
  }
}

export default RegisterDebtService
