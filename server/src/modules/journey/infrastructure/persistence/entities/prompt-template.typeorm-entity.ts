import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('prompt_template')
export class PromptTemplateEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: 64, name: 'key_name', unique: true })
  keyName: string;

  @Column({ type: 'enum', enum: ['image', 'text'] })
  kind: 'image' | 'text';

  @Column({ type: 'text' })
  template: string;

  @Column({ type: 'boolean', name: 'is_active', default: true })
  isActive: boolean;

  @Column({ type: 'datetime', name: 'created_at' })
  createdAt: Date;

  @Column({ type: 'datetime', name: 'updated_at' })
  updatedAt: Date;
}
