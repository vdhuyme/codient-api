import { BASE_STATUS } from '@constants';
import { BaseEntity, Post, User } from '@entities';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity({ name: 'comments' })
export class Comment extends BaseEntity {
  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50, default: BASE_STATUS.PENDING })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  images?: string[];

  @ManyToOne(() => Post, (post) => post.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'post_id' })
  post: Post;

  @ManyToOne(() => User, (user) => user.comments, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
