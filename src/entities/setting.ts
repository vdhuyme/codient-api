import { Entity, Column } from 'typeorm';
import { BaseEntity } from '@entities';

@Entity({ name: 'settings' })
export class Setting extends BaseEntity {
  @Column({ name: 'key', type: 'varchar', length: 255, unique: true })
  key: string;

  @Column({ name: 'value', type: 'text' })
  value: string;
}
