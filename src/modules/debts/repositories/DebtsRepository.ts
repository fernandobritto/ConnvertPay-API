import { EntityRepository, Repository } from 'typeorm'
import Debt from '../entities/Debt'

@EntityRepository(Debt)
export class DebtsRepository extends Repository<Debt> {
  public async findByName(name: string): Promise<Debt | undefined> {
    const debt = this.findOne({
      where: {
        name,
      },
    })
    return debt
  }
}
