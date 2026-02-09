import { Injectable } from '@nestjs/common';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { InjectRepository } from '@nestjs/typeorm';
// import { EntityManager } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StockService {
  // @InjectEntityManager()
  // private manager: EntityManager;
  @InjectRepository(Stock)
  private stockRepository: Repository<Stock>;

  create(createStockDto: CreateStockDto) {
    return this.stockRepository.save(createStockDto);
  }

  findAll() {
    return this.stockRepository.find();
  }

  findOne(id: number) {
    return this.stockRepository.findOne({ where: { id } });
  }

  update(id: number, updateStockDto: UpdateStockDto) {
    return this.stockRepository.update(id, updateStockDto);
  }

  remove(id: number) {
    return this.stockRepository.delete(id);
  }
}
