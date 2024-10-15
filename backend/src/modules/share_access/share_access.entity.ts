import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('share_access')
export class AccessEntity {
  @PrimaryColumn()
  object_id: string;

  @PrimaryColumn()
  user_id: string;

  @Column()
  permission: string;

  @Column()
  object_type: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
}
