// Libraries
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// Constants
import { ROUTES } from '@app/constants';

@Entity(ROUTES.COMMENT)
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  objectId: string;

  @Column({ length: 10 })
  objectType: string;

  @Column({ type: 'text', nullable: true })
  content: string;

  @Column({ nullable: true })
  parentId: string | null;

  @Column()
  threadId: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  updated_at: Date;
}
