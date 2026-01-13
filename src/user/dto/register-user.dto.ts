import { IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
  @IsNotEmpty({ message: "username can't be empty" })
  username: string;
  @IsNotEmpty({ message: "password can't be empty" })
  @MinLength(8, { message: 'password must greater 8 character' })
  password: string;
}
