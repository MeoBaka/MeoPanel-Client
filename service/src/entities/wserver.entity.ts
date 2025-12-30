import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('wservers')
export class Wserver {
  @PrimaryGeneratedColumn('uuid', { name: 'server_uuid' })
  id: string;

  @Column({ type: 'varchar', length: 255 })
  servername: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  uuid: string;

  @Column({ type: 'varchar', length: 500 })
  token: string;

  @CreateDateColumn({ type: 'timestamp', nullable: true })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp', nullable: true })
  updated_at: Date;
}