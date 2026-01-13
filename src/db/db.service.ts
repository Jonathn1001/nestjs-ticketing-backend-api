import { Inject, Injectable } from '@nestjs/common';
import type { DBModuleOptions } from './db.module';
import { access, writeFile, readFile } from 'fs/promises';

@Injectable()
export class DbService {
  @Inject('OPTIONS')
  private options: DBModuleOptions;

  async read() {
    const filePath = this.options.path;
    try {
      await access(filePath);
      const data = await readFile(filePath, { encoding: 'utf-8' });
      const parsedData = JSON.parse(data);
      return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      return [];
    }
  }

  async write(obj: Record<string, any>) {
    await writeFile(this.options.path, JSON.stringify(obj || []), {
      encoding: 'utf-8',
    });
  }
}
