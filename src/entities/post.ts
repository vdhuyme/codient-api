import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity, Category, Comment, User } from '@entities';
import { BASE_STATUS, BaseStatus } from '@constants';

@Entity({ name: 'posts' })
export class Post extends BaseEntity {
  @Column({ type: 'varchar', length: 500 })
  title: string;

  @Column({ type: 'varchar', length: 1000, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 1000 })
  excerpt: string;

  @Column({ type: 'varchar', nullable: true })
  thumbnail?: string | null;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: BASE_STATUS.ACTIVATED,
  })
  status: BaseStatus;

  @Column({ type: 'int', nullable: true })
  readTime?: number | null;

  @Column({ type: 'int', default: 0 })
  views: number;

  @ManyToOne(() => Category, (category) => category.posts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => User, (user) => user.posts, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'auth_id' })
  author: User;

  @OneToMany(() => Comment, (comment) => comment.post, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  comments: Comment[];
}
