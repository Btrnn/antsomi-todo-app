//import { IdentifyId } from '@app/types';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('board')
export class BoardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column()
  position: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  owner_id: string;
}
