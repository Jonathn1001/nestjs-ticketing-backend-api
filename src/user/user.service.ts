import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { User } from './entities/user.entity';
import { DbService } from 'src/db/db.service';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  @Inject(DbService)
  dbService: DbService;

  async login(loginUserDto: LoginUserDto) {
    const users: User[] = await this.dbService.read();
    const userFound = users.find((u) => u.username === loginUserDto.username);
    if (!userFound) throw new BadRequestException('invalid credentials');
    if (userFound.password !== loginUserDto.password) {
      throw new BadRequestException('invalid credentials');
    }
    return userFound;
  }

  async register(registerDto: RegisterUserDto) {
    const users: User[] = await this.dbService.read();
    if (users.find((u) => u.username === registerDto.username)) {
      throw new BadRequestException('username already exists');
    }
    const user = new User();
    user.username = registerDto.username;
    user.password = registerDto.password;

    users.push(user);
    await this.dbService.write(users);
    return user;
  }

  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
