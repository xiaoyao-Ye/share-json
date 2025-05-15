import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * 根据UUID获取用户，如果不存在则创建
   * @param uuid 客户端生成的UUID
   * @returns 用户实体
   */
  async getOrCreateUser(uuid: string): Promise<User> {
    let user = await this.usersRepository.findOne({ where: { uuid } });

    if (!user) {
      user = this.usersRepository.create({
        id: uuidv4(),
        uuid,
      });
      await this.usersRepository.save(user);
    }

    return user;
  }

  /**
   * 根据ID获取用户
   * @param id 用户ID
   * @returns 用户实体
   */
  // async findById(id: string): Promise<User> {
  //   return this.usersRepository.findOne({ where: { id } });
  // }
}
