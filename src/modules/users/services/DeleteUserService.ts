import AppError from '@server/errors/AppError'
import { getCustomRepository } from 'typeorm'
import UsersRepository from '../repositories/UsersRepository'

interface IRequest {
  id: string
}

class DeleteUserService {
  public async execute({ id }: IRequest): Promise<void> {
    const usersRepository = getCustomRepository(UsersRepository)

    const user = await usersRepository.findOne(id)

    if (!user) {
      throw new AppError('Registro de dívida não encontrado')
    }

    await usersRepository.remove(user)
  }
}

export default DeleteUserService
