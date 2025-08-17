import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Conversation, conversation => conversation.messages, { onDelete: 'CASCADE' })
  conversation: Conversation;

  @Column()
  role: 'user' | 'assistant';

  @Column('text')
  content: string;

  @CreateDateColumn()
  timestamp: Date;

  @Column('jsonb', { nullable: true })
  metadata: Record<string, any>;
}