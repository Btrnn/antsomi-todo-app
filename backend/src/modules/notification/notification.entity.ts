import { ROUTES } from '@app/constants';
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity(ROUTES.NOTIFICATION)
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ length: 50 })
  type: string;

  @Column({ default: 'unread' })
  status: string;

  @Column({ nullable: true })
  url?: string;

  @Column({ type: 'jsonb', nullable: true })
  data?: Record<string, any>;

  //   @Column({ default: false })
  //   isPushed: boolean; // Đã gửi thông báo qua các kênh (email/SMS)

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt: Date | null;
}
