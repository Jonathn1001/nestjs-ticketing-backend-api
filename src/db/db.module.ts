import { Module } from '@nestjs/common';
import { DbService } from './db.service';

export interface DBModuleOptions {
  path: string;
}

@Module({})
export class DbModule {
  static register(options: DBModuleOptions) {
    return {
      module: DbModule,
      providers: [
        {
          provide: 'OPTIONS',
          useValue: options,
        },
        DbService,
      ],
      exports: [DbService],
    };
  }
}
