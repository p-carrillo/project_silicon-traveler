import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('journey_entry')
export class JourneyEntryEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'char', length: 36, name: 'journey_id' })
  journeyId: string;

  @Column({ type: 'char', length: 36, name: 'journey_stop_id' })
  journeyStopId: string;

  @Column({ type: 'date', name: 'travel_date' })
  travelDate: string;

  @Column({ type: 'int', name: 'stage_index' })
  stageIndex: number;

  @Column({ type: 'varchar', length: 512, name: 'image_url' })
  imageUrl: string;

  @Column({ type: 'varchar', length: 256, name: 'image_storage_key' })
  imageStorageKey: string;

  @Column({ type: 'text', name: 'text_body' })
  textBody: string;

  @Column({ type: 'char', length: 36, name: 'image_prompt_id' })
  imagePromptId: string;

  @Column({ type: 'char', length: 36, name: 'text_prompt_id' })
  textPromptId: string;

  @Column({ type: 'varchar', length: 64, name: 'image_model' })
  imageModel: string;

  @Column({ type: 'varchar', length: 64, name: 'text_model' })
  textModel: string;

  @Column({ type: 'datetime', name: 'created_at' })
  createdAt: Date;
}
