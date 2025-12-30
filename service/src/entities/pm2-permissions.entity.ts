import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Wserver } from './wserver.entity';

export enum PM2Permission {
  VIEW = 'view',
  CONTROL = 'control', // start, stop, restart, send
  EDIT_NOTE = 'edit_note',
  CONTROL_FILE = 'control_file', // read/write files
  SAVE_RESURRECT = 'save_resurrect'
}

@Entity('pm2_permissions')
export class PM2Permissions {
  @PrimaryGeneratedColumn('uuid', { name: 'uuid' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'uuid', name: 'wserver_id' })
  wserverId: string;

  @ManyToOne(() => Wserver)
  @JoinColumn({ name: 'wserver_id' })
  wserver: Wserver;

  @Column({ type: 'varchar', length: 255, name: 'pm2_process_name' })
  pm2ProcessName: string;

  @Column({ type: 'simple-array', name: 'permissions' })
  permissions: PM2Permission[];

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}