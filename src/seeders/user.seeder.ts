import 'dotenv/config';
import { User } from '@entities/user';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { DataSource } from 'typeorm';
import bcrypt from 'bcryptjs';

export default class UserSeeder extends Seeder {
  async run(dataSource: DataSource) {
    const email: string = process.env.DEFAULT_USER_EMAIL as string;
    const password: string = process.env.DEFAULT_USER_PASSWORD as string;
    if (!email || !password) {
      throw new Error('Missing email or password in environment variables');
    }
    const hashedPwd = bcrypt.hashSync(password, 10);
    await dataSource.getRepository<User>(User).insert({
      name: 'Vo Duc Huy',
      email: email,
      password: hashedPwd,
      superUser: 1,
    });
  }
}
