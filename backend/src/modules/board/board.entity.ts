// Libraries
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// Constants
import { ROUTES } from '@app/constants';

@Entity(ROUTES.BOARD)
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
