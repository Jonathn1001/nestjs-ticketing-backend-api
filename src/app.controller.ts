import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private logger = new Logger();
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    this.logger.error('err', AppController.name);
    this.logger.debug('debug', AppController.name);
    this.logger.log('log', AppController.name);
    this.logger.verbose('vebose', AppController.name);
    this.logger.warn('warn', AppController.name);
    this.logger.fatal('fatal', AppController.name);
    return this.appService.getHello();
  }
}
