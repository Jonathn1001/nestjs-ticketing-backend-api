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
} from '@nestjs/common';
import { UserService } from './user.service';
import { MyLogger } from '../logger/my.logger';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { storage } from './oss';
import * as path from 'path';
import * as fs from 'fs';
import { mergeChunkedFile } from '../utils/files';

@Controller('user')
export class UserController {
  private readonly logger = new MyLogger();

  constructor(private readonly userService: UserService) {}

  @Post('log')
  log(@Body() body) {
    this.logger.log(JSON.stringify(body), 'UserController');
  }

  @Post('register')
  register(@Body() registerDto: RegisterUserDto) {
    this.logger.log(
      `register user dto: ${JSON.stringify(registerDto)}`,
      'UserController',
    );
    return this.userService.register(registerDto);
  }

  @Post('upload/large-file')
  @UseInterceptors(
    FilesInterceptor('files', 20, {
      dest: 'uploads',
    }),
  )
  async uploadLargeFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: { name: string; isLastChunk?: string },
  ) {
    this.logger.log(
      `upload files body: ${JSON.stringify(body)}`,
      'UserController',
    );
    this.logger.log(
      `upload files: ${files.map((f) => f.filename).join(', ')}`,
      'UserController',
    );

    const fileName = body.name.match(/(.+)-\d+$/)?.[1] ?? body.name;
    this.logger.log(`fileName: ${fileName}`, 'UserController');
    const nameDir = 'uploads/chunks-' + fileName;

    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    if (!fs.existsSync(nameDir)) {
      fs.mkdirSync(nameDir);
    }

    // Save the chunk
    fs.cpSync(files[0].path, nameDir + '/' + body.name);
    fs.rmSync(files[0].path);

    // Check if this is the last chunk
    if (body.isLastChunk === 'true') {
      // Extract original filename (remove random suffix)
      const originalFileName = fileName.replace(/^[^-]+-/, '');
      const outputPath = `uploads/${originalFileName}`;

      // Merge all chunks using utility function
      const result = await mergeChunkedFile(nameDir, outputPath);

      return result;
    }
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
    this.logger.log(`upload file: ${file.path}`, 'UserController');
    return file.path;
  }

  @Post('login')
  login(@Body() loginDto: LoginUserDto) {
    this.logger.log(
      `login user: ${JSON.stringify(loginDto)}`,
      'UserController',
    );
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
