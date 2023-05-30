import { Injectable } from '@nestjs/common';
import UserRepository from '../users/users.repository';

export type User = any;

@Injectable()
export class UsersService {
  private userRepository = new UserRepository();

  async findOne(username: string, password: string): Promise<User | undefined> {
    const user = await this.userRepository.getLoginEBS(username, password);
    return JSON.parse(user);
  }

  async findRoles(username: string) {
    return;
  }
}
