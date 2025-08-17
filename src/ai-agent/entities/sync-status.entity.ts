import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sync_status')
export class SyncStatusEntity {
    @PrimaryColumn()
    entity_type: string;

    @Column({ type: 'timestamp' })
    last_sync: Date;

    @Column({ length: 64 })
    checksum: string;

    @Column({ type: 'integer', default: 0 })
    document_count: number;

    @Column({ type: 'text', nullable: true })
    last_error: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}