import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity, Permission, User } from '@entities';
import { BASE_STATUS, BaseStatus } from '@constants';

@Entity({ name: 'roles' })
export class Role extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({
    type: 'varchar',
    length: 50,
    default: BASE_STATUS.ACTIVATED,
  })
  status: BaseStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description?: string;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permission',
    joinColumn: { name: 'role_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'permission_id', referencedColumnName: 'id' },
  })
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
