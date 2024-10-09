import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('group')
export class GroupEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column()
  position: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ length: 255 })
  type: string;

  @Column({ length: 7 })
  color: string;

  @Column()
  owner_id: string;
}
