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

  @Column({ type: 'varchar', length: 512, name: 'image_url_full' })
  imageUrlFull: string;

  @Column({ type: 'varchar', length: 512, name: 'image_url_web' })
  imageUrlWeb: string;

  @Column({ type: 'varchar', length: 512, name: 'image_url_thumb' })
  imageUrlThumb: string;

  @Column({ type: 'varchar', length: 256, name: 'image_storage_key_full' })
  imageStorageKeyFull: string;

  @Column({ type: 'varchar', length: 256, name: 'image_storage_key_web' })
  imageStorageKeyWeb: string;

  @Column({ type: 'varchar', length: 256, name: 'image_storage_key_thumb' })
  imageStorageKeyThumb: string;

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
