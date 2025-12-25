import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './user.entity';

export enum AuditAction {
  // Authentication actions
  USER_REGISTER = 'USER_REGISTER',
  USER_LOGIN = 'USER_LOGIN',
  USER_LOGOUT = 'USER_LOGOUT',
  USER_LOGOUT_ALL = 'USER_LOGOUT_ALL',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET = 'PASSWORD_RESET',

  // Email actions
  EMAIL_VERIFICATION_SENT = 'EMAIL_VERIFICATION_SENT',
  EMAIL_VERIFIED = 'EMAIL_VERIFIED',

  // 2FA actions
  TWO_FA_SETUP = 'TWO_FA_SETUP',
  TWO_FA_ENABLED = 'TWO_FA_ENABLED',
  TWO_FA_DISABLED = 'TWO_FA_DISABLED',
  TWO_FA_BACKUP_USED = 'TWO_FA_BACKUP_USED',
  TWO_FA_BACKUP_REGENERATED = 'TWO_FA_BACKUP_REGENERATED',

  // User management actions
  USER_CREATED = 'USER_CREATED',
  USER_UPDATED = 'USER_UPDATED',
  USER_DELETED = 'USER_DELETED',

  // Security actions
  FAILED_LOGIN_ATTEMPT = 'FAILED_LOGIN_ATTEMPT',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',
  TOKEN_REFRESH = 'TOKEN_REFRESH',

  // System actions
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
}

export enum AuditResource {
  USER = 'USER',
  AUTH = 'AUTH',
  SESSION = 'SESSION',
  PASSWORD = 'PASSWORD',
  EMAIL = 'EMAIL',
  TWO_FA = 'TWO_FA',
  SYSTEM = 'SYSTEM',
}

@Entity('audit_logs')
@Index(['userId', 'createdAt'])
@Index(['action', 'createdAt'])
@Index(['resource', 'createdAt'])
export class AuditLogs {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'uuid', nullable: true, name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: AuditAction, name: 'action' })
  action: AuditAction;

  @Column({ type: 'enum', enum: AuditResource, name: 'resource' })
  resource: AuditResource;

  @Column({ type: 'text', nullable: true, name: 'details' })
  details: string; // JSON string with additional details

  @Column({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' })
  ipAddress: string;

  @Column({ type: 'text', nullable: true, name: 'user_agent' })
  userAgent: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'session_id' })
  sessionId: string;

  @Column({ type: 'json', nullable: true, name: 'metadata' })
  metadata: any; // Additional structured data

  @Column({ type: 'tinyint', default: 0, name: 'is_success' })
  isSuccess: number; // 0 = failed, 1 = success

  @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
  createdAt: Date;
}