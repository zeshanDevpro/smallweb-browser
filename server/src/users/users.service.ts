import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { User } from './user.schema';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly users: Model<User>) {}

  async list() {
    const users = await this.users.find().sort({ slug: 1 }).exec();
    return users.map((user) => ({ id: user._id.toString(), name: user.name }));
  }

  async exists(id: string): Promise<boolean> {
    if (!/^[\da-f]{24}$/i.test(id)) return false;
    return (await this.users.exists({ _id: id })) !== null;
  }
}
