// Libraries
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  filePath: string;

  @Column()
  file: File;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  uploadedAt: Date;

  //   @ManyToOne(() => TaskEntity, (task) => task.files, { onDelete: 'CASCADE' })
  //   task: TaskEntity;
}
