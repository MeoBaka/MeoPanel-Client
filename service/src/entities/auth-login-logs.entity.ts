import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('auth_login_logs')
export class AuthLoginLogs {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 36, nullable: true, name: 'session_id' })
  sessionId: string;

  @Column({ type: 'varchar', length: 45, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'text', name: 'user_agent' })
  userAgent: string;

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}