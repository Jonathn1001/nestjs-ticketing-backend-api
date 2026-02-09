import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'stock',
})
export class Stock {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  price: number;
}
