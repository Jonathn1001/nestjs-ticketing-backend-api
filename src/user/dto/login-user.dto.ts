import { IsNotEmpty } from 'class-validator';

export class LoginUserDto {
  @IsNotEmpty({ message: "username can't be empty" })
  username: string;
  @IsNotEmpty({ message: "password can't be empty" })
  password: string;
}
