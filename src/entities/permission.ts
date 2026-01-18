import { Column, Entity, ManyToMany } from 'typeorm';
import { BaseEntity, Role, User } from '@entities';

@Entity({ name: 'permissions' })
export class Permission extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  users: User[];

  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
