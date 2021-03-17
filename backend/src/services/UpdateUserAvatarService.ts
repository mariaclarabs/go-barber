import { getRepository } from 'typeorm';
import path from 'path';
import fs from 'fs';

import User from '../models/User';
import uploadConfig from '../config/upload';
import AppError from '../error/AppError';

interface RequestDTO {
  userId: string;
  avatarFilename: string;
}

class UpdateUserAvatarService {
  async execute({ userId, avatarFilename }: RequestDTO): Promise<User> {
    const usersRepository = getRepository(User);

    const user = await usersRepository.findOne(userId);

    if (!user) {
      throw new AppError('Only authenticated users can change avatar.', 401);
    }

    if (user.avatar) {
      const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar);
      await fs.promises
        .stat(userAvatarFilePath)
        .then(async () => {
          await fs.promises.unlink(userAvatarFilePath);
        })
        .catch(err => console.log(err.message));
    }

    user.avatar = avatarFilename;

    await usersRepository.save(user);

    return user;
  }
}

export default UpdateUserAvatarService;
