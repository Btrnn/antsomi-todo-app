// Libraries
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// Constants
import { ROUTES } from '@app/constants';

@Entity(ROUTES.USER)
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone_number: string;

  @Column()
  password: string;

  @Column()
  email: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;

  @Column()
  role: string;
}
