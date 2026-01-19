import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storage } from './oss';
import * as path from 'path';
import * as fs from 'fs';
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  register(@Body() registerDto: RegisterUserDto) {
    console.log('register user', registerDto);
    return this.userService.register(registerDto);
  }

  @Get('merge/file')
  mergeFile(@Query('file') fileName: string) {
    const nameDir = 'uploads/chunks-' + fileName;

    const files = fs.readdirSync(nameDir);
    let startPos = 0;
    files.map((file) => {
      const filePath = nameDir + '/' + file;
      console.log('merging file ->>>', filePath);
      const streamFile = fs.createReadStream(filePath);
      streamFile.pipe(
        fs.createWriteStream('uploads/' + fileName, { start: startPos }),
      );
      startPos += fs.statSync(filePath).size;
    });
  }

  @Post('upload/large-file')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  uploadLargeFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: { name: string },
  ) {
    console.log('upload files body ->>>', body);
    console.log('upload files ->>>', files);

    const fileName = body.name.match(/(.+)-\d+$/)?.[1] ?? body.name;
    console.log('fileName ->>>', fileName);
    const nameDir = 'uploads/chunks-' + fileName;

    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    if (!fs.existsSync(nameDir)) {
      fs.mkdirSync(nameDir);
    }
    fs.cpSync(files[0].path, nameDir + '/' + body.name);

    fs.rmSync(files[0].path);
  }

  @Post('upload/avatar')
  @UseInterceptors(
    FileInterceptor('file', {
      dest: 'uploads/avatar',
      storage: storage,
      limits: {
        fileSize: 3 * 1024 * 1024,
      },
      fileFilter(req, file, cb) {
        const extName = path.extname(file.originalname);
        if (['.jpg', 'jpeg', '.png', '.gif'].includes(extName)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException('Only supports: .jpg, jpeg, .png and .gif'),
            false,
          );
        }
      },
    }),
  )
  uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    console.log('upload file ->>>', file.path);
    return file.path;
  }

  @Post('login')
  login(@Body() loginDto: LoginUserDto) {
    console.log('login user', loginDto);
    return this.userService.login(loginDto);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(+id);
  }
}
