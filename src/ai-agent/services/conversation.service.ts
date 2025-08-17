import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { Conversation } from '../entities/conversation.entity';
import { Message } from '../entities/message.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as sanitizeHtml from 'sanitize-html';
import { Repository, ILike } from 'typeorm';
import { marked } from 'marked';

@Injectable()
export class ConversationService {
    private readonly logger = new Logger(ConversationService.name);

    constructor(
        @InjectRepository(Conversation)
        private readonly conversationRepo: Repository<Conversation>,
        @InjectRepository(Message)
        private readonly messageRepo: Repository<Message>,
    ) { }

    async createConversation(userId: string, title?: string) {
        const conversation = this.conversationRepo.create({
            userId,
            title: title || 'New Conversation',
        });
        return await this.conversationRepo.save(conversation);
    }

    async listConversations(userId: string, limit = 20, offset = 0) {
        const [conversations, total] = await this.conversationRepo.findAndCount({
            where: { userId },
            order: { updatedAt: 'DESC' },
            take: limit,
            skip: offset,
        });

        return {
            data: conversations,
            meta: {
                total,
                limit,
                offset,
            },
        };
    }

    async getConversation(conversationId: string, userId: string) {
        const conversation = await this.conversationRepo.findOne({
            where: { id: conversationId, userId },
        });

        if (!conversation) throw new NotFoundException('Conversation not found');

        return conversation;
    }

    async updateConversationTitle(conversationId: string, userId: string, title: string) {
        const conversation = await this.getConversation(conversationId, userId);
        conversation.title = title;
        return await this.conversationRepo.save(conversation);
    }

    async deleteConversation(conversationId: string, userId: string) {
        const result = await this.conversationRepo.delete({ id: conversationId, userId });

        if (result.affected === 0) throw new NotFoundException('Conversation not found');

        return { success: true };
    }

    async addMessage(
        conversationId: string,
        content: string,
        role: 'user' | 'assistant',
        metadata: Record<string, any> = {},
    ) {
        // First get the conversation entity
        const conversation = await this.conversationRepo.findOne({ where: { id: conversationId } });
        if (!conversation) throw new NotFoundException(`Conversation with ID ${conversationId} not found`);

        const message = this.messageRepo.create({
            conversation,
            content,
            role,
            metadata,
        });

        // Update conversation's updatedAt
        conversation.updatedAt = new Date();
        await this.conversationRepo.save(conversation);

        return await this.messageRepo.save(message);
    }

    async getConversationMessages(
        conversationId: string,
        userId: string,
        limit = 50,
        offset = 0,
    ) {
        await this.getConversation(conversationId, userId);

        const [messages, total] = await this.messageRepo.findAndCount({
            where: { conversation: { id: conversationId } },
            order: { timestamp: 'ASC' },
            take: limit,
            skip: offset,
        });

        return {
            data: messages,
            meta: {
                total,
                limit,
                offset,
            },
        };
    }

    async searchConversationMessages(
        conversationId: string,
        userId: string,
        query: string,
        limit = 20,
    ) {
        await this.getConversation(conversationId, userId);

        const [messages, total] = await this.messageRepo.findAndCount({
            where: {
                conversation: { id: conversationId },
                content: ILike(`%${query}%`),
            },
            order: { timestamp: 'DESC' },
            take: limit,
        });

        return {
            data: messages,
            meta: {
                total,
                limit,
            },
        };
    }

    async generateConversationTitle(firstMessage: string): Promise<string> {
        // Simple implementation - in a real app, you might want to use an LLM for this
        const maxLength = 50;
        if (firstMessage.length <= maxLength) {
            return firstMessage;
        }
        return `${firstMessage.substring(0, maxLength - 3)}...`;
    }

    async convertToSafeHtml(markdown: string): Promise<string> {
        try {
            const rawHtml = await marked(markdown);
            const allowedTags = [
                'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
                'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr',
                'br', 'div', 'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre', 'img'
            ];
            const allowedAttributes = {
                a: ['href', 'name', 'target'],
                img: ['src', 'alt', 'title', 'width', 'height'],
                '*': ['style'],
            };
            const safeHtml = sanitizeHtml(rawHtml, {
                allowedTags,
                allowedAttributes,
            });
            return safeHtml;
        } catch (error) {
            this.logger.error('Error converting markdown to HTML', error);
            return markdown;
        }
    }


}
