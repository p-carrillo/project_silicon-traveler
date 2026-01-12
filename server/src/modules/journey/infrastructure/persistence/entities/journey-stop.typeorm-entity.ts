import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('journey_stop')
export class JourneyStopEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36, name: 'journey_id' })
  journeyId: string;

  @Column({ type: 'varchar', length: 128 })
  title: string;

  @Column({ type: 'varchar', length: 128, nullable: true })
  city: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  country: string | null;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'int' })
  sequence: number;

  @Column({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
