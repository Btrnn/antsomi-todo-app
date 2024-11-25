// Libraries
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Constants
import { ROUTES } from '@app/constants';

@Entity(ROUTES.COMMENT)
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string;

  @Column()
  object_id: string;

  @Column({ length: 10 })
  object_type: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  parent_id: string | null;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updated_at: Date | null;
}
