import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('post')
export class PostEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  value: string;
}
