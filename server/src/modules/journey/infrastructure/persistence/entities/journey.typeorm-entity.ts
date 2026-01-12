import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('journey')
export class JourneyEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 128 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({
    type: 'enum',
    enum: ['draft', 'active', 'completed'],
    default: 'draft',
  })
  status: 'draft' | 'active' | 'completed';

  @Column({ type: 'date', name: 'start_date', nullable: true })
  startDate: string | null;

  @Column({ type: 'varchar', length: 64, default: 'UTC' })
  timezone: string;

  @Column({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
