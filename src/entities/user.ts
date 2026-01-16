import { BASE_STATUS } from '@constants/base.status';
import { Entity, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { Post } from '@entities/post';
import { Comment } from '@entities/comment';
import { BaseEntity } from '@entities/base-entity';
import { Role } from '@entities/role';
import { Permission } from '@entities/permission';

@Entity({ name: 'users' })
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar?: string | null;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phoneNumber?: string | null;

  @Column({ type: 'date', nullable: true })
  dob?: string | null;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 50,
    default: BASE_STATUS.ACTIVATED,
  })
  status: string;

  @Column({ name: 'super_user', type: 'boolean', default: 0 })
  superUser: number;

  @OneToMany(() => Post, (post) => post.author, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  posts: Post[];

  @OneToMany(() => Comment, (comment) => comment.user, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  comments: Comment[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_role',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  roles: Role[];

  @ManyToMany(() => Permission, (permission) => permission.users)
  @JoinTable({
    name: 'user_permission',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  permissions: Permission[];
}
