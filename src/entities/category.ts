import {
  Entity,
  Column,
  Tree,
  TreeChildren,
  TreeParent,
  OneToMany,
} from 'typeorm';
import { BASE_STATUS } from '@constants/base.status';
import { Post } from '@entities/post';
import { BaseEntity } from '@entities/base-entity';

@Entity('categories')
@Tree('closure-table', {
  ancestorColumnName: () => 'ancestor_id',
  descendantColumnName: () => 'descendant_id',
})
export class Category extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail?: string | null;

  @Column({ type: 'varchar', nullable: true })
  icon?: string | null;

  @Column({ type: 'varchar', unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 50, default: BASE_STATUS.PUBLISHED })
  status: string;

  @Column({ type: 'text', nullable: true })
  description?: string | null;

  @TreeChildren({ cascade: true })
  children?: Category[];

  @TreeParent({ onDelete: 'SET NULL' })
  parent?: Category | null;

  @OneToMany(() => Post, (post) => post.category, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  posts: Post[];
}
