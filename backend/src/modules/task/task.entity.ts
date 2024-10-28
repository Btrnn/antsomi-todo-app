// Libraries
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// Constants
import { ROUTES } from '@app/constants';

@Entity(ROUTES.TASK)
export class TaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column()
  description: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  start_date: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  end_date: Date | null;

  @Column()
  status_id: string;

  @Column()
  position: number;

  @Column()
  assignee_id: string;

  @Column({ nullable: true })
  est_time: string | null;

  @Column()
  owner_id: string;
}
